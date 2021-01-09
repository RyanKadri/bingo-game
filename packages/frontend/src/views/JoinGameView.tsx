import ky from "ky";
import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Header, Loader } from "semantic-ui-react";
import useSWR from "swr";
import { BingoGame, CreatedBoard } from "../../../common/src/types/board";
import { config } from "../utils/config";
import sharedStyles from "./game-view.module.css";

export function JoinGameView() {
    const { gameId } = useParams<{ gameId: string }>();
    const history = useHistory();
    const fetchGameURL = `${config.backend}/games/${gameId}`;

    const { data } = useSWR<BingoGame>(fetchGameURL, () => (
        ky.get(fetchGameURL).json<BingoGame>()
    ));

    useEffect(() => {
        if(data) {
            ky.post(`${config.backend}/games/${gameId}/boards`, {
                json: {
                    ...data.gameParams
                }
            })
            .json<CreatedBoard>()
            .then(newBoard => {
                history.push(`/game/${gameId}/board/${newBoard.id}`)
            });
        }
    }, [gameId, data, history])

    return (
        <main className={ sharedStyles.container }>
            <Header>Joining { !data ? "Game" : data.name }</Header>
            <Loader active inline />
        </main>
    )
}