import ky from "ky";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import { BingoGame, CreatedBoard, NewBoard } from "../../../common/src/types/board";
import { BingoBoard } from "../components/BingoBoard";
import { config } from "../utils/config";

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

    return (
        <main>
            { gameRes.isValidating || boardLoading
                ? <h1>Loading</h1>
                : (gameRes.error || boardError || !board || !gameRes.data)
                    ? <h1>Error</h1>
                    : (
                        <>
                            <h1>Playing { gameRes.data.name }</h1>
                            { !!board && <BingoBoard board={ board } canSelect={true} /> }
                        </>
                    )
            }
        </main>
    )
}