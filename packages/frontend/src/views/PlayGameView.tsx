import ky from "ky";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import { BingoGame, CreatedBoard } from "../../../common/src/types/board";
import { BingoBoard } from "../components/BingoBoard";
import { config } from "../utils/config";
import styles from "./game-view.module.css";

export function PlayGameView() {

    const { gameId, boardId } = useParams<{ gameId: string, boardId: string }>();
    const gameUrl = `${config.backend}/games/${gameId}`;
    const boardUrl = `${config.backend}/boards/${boardId}`;

    const gameRes = useSWR(gameUrl, () => (
        ky.get(gameUrl).json<BingoGame>()
    ));

    const { data: boardData, error: boardError, isValidating: boardLoading } = useSWR(boardUrl, () => (
        ky.get(boardUrl).json<CreatedBoard>()
    ));

    const [ board, setBoard ] = useState<CreatedBoard | null>(null);

    useEffect(() => {
        if(boardData) {
            setBoard(boardData)
        }
    }, [boardData]);

    const onCellSelect = async (col: number, row: number) => {
        if(boardData) {
            const oldBoard = boardData;
            const newBoard: CreatedBoard = {
                ...oldBoard,
                categories: [...oldBoard.categories]
            };
            const cell = newBoard.categories[col][row];
            cell.selected = true;

            try {
                setBoard(newBoard);
                const definiteBoard = await ky.put(`${config.backend}/boards/${boardId}`, {
                    json: newBoard
                }).json<CreatedBoard>()
                setBoard(definiteBoard);
            } catch(e) {
                setBoard(oldBoard);
            }
        }
    }

    return (
        <main className={ styles.container }>
            { !gameRes.data && (gameRes.isValidating || boardLoading)
                ? <h1>Loading</h1>
                : (gameRes.error || boardError || !board || !gameRes.data)
                    ? <h1>Error</h1>
                    : (
                        <>
                            <h1>Bingo XTreme</h1>
                            <h2>Game: { gameRes.data.name }</h2>
                            <h4>Players: { gameRes.data.boards.length }</h4>
                            <p>As your caller picks numbers, click on board squares to mark them</p>
                            <p>
                                You have to keep an eye on your board to see if you won. The site won't
                                detect it automatically. That's part of the fun of Bingo!
                            </p>
                            { !!board && (
                                <BingoBoard board={ board } canSelect={true} onCellSelect={ onCellSelect } /> 
                            )}
                        </>
                    )
            }
        </main>
    )
}