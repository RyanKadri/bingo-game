import classnames from "classnames";
import ky from "ky";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Checkbox, Form, Header, Icon, Input, Label } from "semantic-ui-react";
import useSWR from "swr";
import { BingoGame, BoardParams, Cell, NewBoard } from "../../../common/src/types/board";
import { pickRandomFrom } from "../../../common/src/utils/utils";
import { BingoBoard } from "../components/BingoBoard";
import { config } from "../utils/config";
import styles from "./game-view.module.css";

function formTrackingBoard(gameInfo: BingoGame): NewBoard {
    const columns: Cell[][] = [];
    const numsPerColumn = gameInfo.gameParams.maxNumber / gameInfo.gameParams.letters.length;
    let colStart = 1;
    const selectedNumSet = new Set(gameInfo.calledNumbers);
    for(let i = 0; i < gameInfo.gameParams.letters.length; i++) {
        const newColumn: Cell[] = [];
        for(let j = 0; j < numsPerColumn; j++) {
            const number = colStart + j;
            newColumn.push({
                number,
                type: "number",
                selected: selectedNumSet.has(number)
            });
        }
        columns.push(newColumn)
        colStart += numsPerColumn
    }
    return {
        categories: columns,
        letters: gameInfo.gameParams.letters
    }
}

export function HostGameView() {

    const { gameId } = useParams<{ gameId: string }>();
    const gameResourceUrl = `${config.backend}/games/${gameId}`;
    const joinableLink = `${window.location.origin}/game/${gameId}`;
    const [ trackingBoard, setTrackingBoard ] = useState<NewBoard | null>(null);
    const [ copyTooltip, setCopyTooltip ] = useState(false);
    const [ manualPick, setManualPick ] = useState(false);

    const { data: gameData, error, isValidating, mutate } = useSWR<BingoGame>(gameResourceUrl, () => (
        ky.get(gameResourceUrl).json<BingoGame>()
    ));

    const lastNumber = gameData?.calledNumbers[gameData.calledNumbers.length -1];

    useEffect(() => {
        if(gameData) {
            setTrackingBoard(formTrackingBoard(gameData))
        }
    }, [gameData]);

    const onCopyVisitLink = () => {
        setCopyTooltip(true);
        navigator.clipboard.writeText(joinableLink)
            .then(console.log)
            .catch(console.error);
        setTimeout(() => setCopyTooltip(false), 2000)
    }

    const onSelectCell = async (selectedCell: Cell) => {
        if(selectedCell.type === "free") {
            throw new Error("Only expected numbers to be picked");
        }
        if(gameData) {
            const oldBoard = trackingBoard;

            const gameUpdate: BingoGame = { 
                ...gameData,
                calledNumbers: !selectedCell.selected
                    ? [...gameData.calledNumbers, selectedCell.number]
                    : gameData.calledNumbers.filter(num => num !== selectedCell.number)
            }
            
            setTrackingBoard(formTrackingBoard(gameUpdate));
            mutate(gameUpdate, false);
            
            try {
                await ky.put(`${config.backend}/games`, {
                    json: gameUpdate
                }).json();
            } catch(e) {
                setTrackingBoard(oldBoard)
            }
        }
    }

    const onPickRandomCell = () => {
        const availableCells: Cell[] = []
        for(const cat of trackingBoard!.categories) {
            for(const cell of cat) {
                if(cell.type === "number" && !gameData!.calledNumbers.includes(cell.number)) {
                    availableCells.push(cell);
                }
            }
        }
        onSelectCell(pickRandomFrom(availableCells));
    }

    return (
        <main className={ styles.container }>
            { (isValidating && !gameData)
                ? <h1>Loading</h1>
                : (error || !gameData)
                    ? <h1>Error</h1>
                    : (
                        <>
                            <Header as="h1">
                                Hosting "{ gameData.name }"
                                <Label color="black"><Icon name="users" />{ gameData.boards.length } joined</Label>
                            </Header>
                            <Form.Field>
                                <Input 
                                    type="text" size="small"
                                    className={ styles.linkInput }
                                    value={ joinableLink }
                                    action={{
                                        color: "blue",
                                        icon: "copy",
                                        onClick: onCopyVisitLink
                                    }} />
                                <Label pointing="left" color="black" 
                                       className={ classnames(styles.copyLabel, { [ styles.show ]: copyTooltip }) }>
                                    Copied
                                </Label>
                            </Form.Field>
                            { !!trackingBoard && (
                                <section className={ styles.boardContainer }>
                                    <Form.Group widths="equal" className={ styles.controls }>
                                        <label>Pick Manually
                                            <Checkbox toggle
                                                    checked={ manualPick } onChange={(_, e) => setManualPick(e.checked ?? false)} />
                                        </label>
                                        { !manualPick && (
                                            <Button onClick={ onPickRandomCell }>Pick</Button>
                                        )}
                                        { lastNumber!== undefined && (
                                            <LastNumberDisplay num={ lastNumber } 
                                                               gameParams={ gameData.gameParams } />
                                        ) }
                                    </Form.Group>
                                    <BingoBoard board={ trackingBoard } rowWise canSelect={ manualPick }
                                                onCellSelect={ (_,__,cell) => onSelectCell(cell) } /> 
                                </section>
                            )}
                        </>
                    )
            }
        </main>
    )
}

interface LastNumberProps {
    num: number;
    gameParams: BoardParams;
}
function LastNumberDisplay({ num, gameParams }: LastNumberProps) {
    const colors = [
        'red',
        'green',
        'orange',
        'violet',
        'yellow',
        'olive',
        'teal',
        'blue',
        'purple',
        'pink',
        'brown',
        'grey',
        'black',
      ];

    const lastNumberCol = Math.floor(num / gameParams.maxNumber * gameParams.letters.length )
    const letter = gameParams.letters[lastNumberCol];

    return (
        <div className={ styles.lastNumber }>
            Last Picked:&nbsp;
            <Label color={ colors[lastNumberCol % colors.length] as any }>{ letter } - { num }</Label>
        </div>
    )
}