import ky from "ky";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header, Icon, Label, Message } from "semantic-ui-react";
import useSWR from "swr";
import { BingoGame, CreatedBoard } from "../../../common/src/types/board";
import { BingoBoard } from "../components/BingoBoard";
import { config } from "../utils/config";
import styles from "./game-view.module.css";

export function PlayGameView() {

    const { gameId, boardId } = useParams<{ gameId: string, boardId: string }>();
    const gameUrl = `${config.backend}/games/${gameId}`;
    const boardUrl = `${config.backend}/boards/${boardId}`;

    const { data: gameData } = useSWR(gameUrl, () => (
        ky.get(gameUrl).json<BingoGame>()
    ));

    const { data: boardData } = useSWR(boardUrl, () => (
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
            cell.selected = !cell.selected;

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
            { (!gameData || !boardData)
                ? <h1>Loading</h1>
                : (
                    <>
                        <Header as="h1">{ gameData.name } <Label color="black"><Icon name="users" />{ gameData.boards.length } playing</Label></Header>
                        <Message info>
                            <Message.List>
                                <Message.Item>As your caller picks numbers, click on board squares to mark them</Message.Item>
                                <Message.Item>Keep an eye on your board. The site won't detect Bingo. That's part of the fun</Message.Item>
                            </Message.List>
                        </Message>
                        { !!board && (
                            <BingoBoard board={ board } canSelect={true} onCellSelect={ onCellSelect } /> 
                        )}
                    </>
                )
            }
        </main>
    )
}