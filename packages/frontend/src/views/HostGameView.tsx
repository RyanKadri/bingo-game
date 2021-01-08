import ky from "ky";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import { BingoGame, Cell, NewBoard } from "../../../common/src/types/board";
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
    const linkInput = useRef<HTMLInputElement>(null);

    const { data: gameData, error, isValidating, mutate } = useSWR<BingoGame>(gameResourceUrl, () => (
        ky.get(gameResourceUrl).json<BingoGame>()
    ));

    useEffect(() => {
        if(gameData) {
            setTrackingBoard(formTrackingBoard(gameData))
        }
    }, [gameData]);

    const onCopyVisitLink = () => {
        linkInput.current!.select();
        navigator.clipboard.writeText(joinableLink)
            .then(console.log)
            .catch(console.error);
    }

    const onSelectCell = async (_: number, __: number, selectedCell: Cell) => {
        if(selectedCell.type === "free") {
            throw new Error("Only expected numbers to be picked");
        }
        if(gameData) {
            const oldBoard = trackingBoard;

            const gameUpdate: BingoGame = { 
                ...gameData,
                calledNumbers: [...gameData.calledNumbers, selectedCell.number]
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

    return (
        <main className={ styles.container }>
            { (isValidating && !gameData)
                ? <h1>Loading</h1>
                : (error || !gameData)
                    ? <h1>Error</h1>
                    : (
                        <>
                            <h1>Hosting game { gameData.name } ({ gameData.boards.length } players)</h1>
                            <p>Copy this link and share it with your friends</p>
                            <input type="text" disabled className={ styles.shareLink }
                                   size={ joinableLink.length }
                                   value={ joinableLink }
                                   ref={ linkInput } />
                            <button onClick={ onCopyVisitLink }>Copy</button>
                            { !!trackingBoard && (
                                <BingoBoard board={ trackingBoard } rowWise canSelect
                                            onCellSelect={ onSelectCell } /> 
                            )}
                        </>
                    )
            }
        </main>
    )
}