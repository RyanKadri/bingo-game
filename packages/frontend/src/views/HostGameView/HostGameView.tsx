import ky from "ky";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Form, Header } from "semantic-ui-react";
import useSWR from "swr";
import { BingoGame, Cell, NewBoard, Player } from "../../../../common/src/types/types";
import { pickRandomFrom } from "../../../../common/src/utils/utils";
import { BingoBoard } from "../../components/BingoBoard";
import { GamePlayersLabel } from "../../components/GamePlayersLabel";
import { LastNumberDisplay } from "../../components/LastNumberDisplay";
import { BingoEventService } from "../../services/websocket-events";
import { config } from "../../utils/config";
import styles from "../game-view.module.css";
import { BingoAlert } from "./BingoAlert";
import { CallHistory } from "./CallHistory";
import { JoinGameLink } from "./JoinGameLink";

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

interface Props {
    eventService: BingoEventService;
    player?: Player;
}
export function HostGameView({ eventService, player }: Props) {

    const { gameId } = useParams<{ gameId: string }>();
    const gameResourceUrl = `${config.backend}/games/${gameId}`;
    
    const [ trackingBoard, setTrackingBoard ] = useState<NewBoard | null>(null);

    const { data: gameData, error, mutate } = useSWR<BingoGame>(gameResourceUrl, () => (
        ky.get(gameResourceUrl).json<BingoGame>()
    ));

    useEffect(() => {
        if(gameData) {
            setTrackingBoard(formTrackingBoard(gameData))
        }
    }, [gameData]);

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
                await ky.patch(`${config.backend}/games`, {
                    json: {
                        id: gameId,
                        calledNumbers: gameUpdate.calledNumbers
                    }
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

    useEffect(() => {
        eventService.connect()
            .then(() => {
                if(player) {
                    eventService.subscribeToGame(gameId, player.id, player.name, true);
                    eventService.onGameSync(e => {
                        if(e.game.id === gameId) {
                            mutate(old => {
                                if(old) {
                                    return {
                                        ...old,
                                        ...e.game
                                    }
                                }
                            });
                        }
                    })
                }
            });
        return () => { 
            if(player) {
                eventService.unsubscribe(gameId, player.id, player.name) 
            }
        }
    }, [ eventService, gameId, mutate, player ])

    return (
        <main className={ styles.container }>
            { (!gameData && !error)
                ? <Header>Loading</Header>
                : (!gameData && error)
                    ? <h1>Error</h1>
                    : (
                        <>
                            <Header as="h1">
                                Hosting "{ gameData!.name }"
                                <GamePlayersLabel players={ gameData?.players ?? [] } />
                            </Header>
                            <JoinGameLink gameId={ gameId }></JoinGameLink>
                            { gameData && gameData.bingoCalls.length > 0 && (
                                <BingoAlert bingoCalls={ gameData.bingoCalls } />
                            )}
                            { !!trackingBoard && (
                                <section className={ styles.boardContainer }>
                                    <Form.Group widths="equal" className={ styles.controls }>
                                        <Button onClick={ onPickRandomCell }>Next Number</Button>
                                        { gameData && (
                                            <LastNumberDisplay gameData={ gameData } />
                                        ) }
                                    </Form.Group>
                                    <BingoBoard board={ trackingBoard } rowWise canSelect={ false }
                                                onCellSelect={ (_,__,cell) => onSelectCell(cell) } /> 
                                </section>
                            )}
                            { (gameData?.calledNumbers && gameData.calledNumbers.length > 0) && (
                                <CallHistory calledNumbers={ gameData.calledNumbers } gameParams={ gameData.gameParams }/>
                            )}
                        </>
                    )
            }
        </main>
    )
}