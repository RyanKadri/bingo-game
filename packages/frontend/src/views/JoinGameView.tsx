import ky from "ky";
import { useHistory, useParams } from "react-router-dom";
import useSWR from "swr";
import { BingoGame, CreatedBoard } from "../../../common/src/types/board";
import { config } from "../utils/config";

export function JoinGameView() {
    const { gameId } = useParams<{ gameId: string }>();
    const history = useHistory();
    const fetchGameURL = `${config.backend}/games/${gameId}`;

    const { data, isValidating } = useSWR<BingoGame>(fetchGameURL, () => (
        ky.get(fetchGameURL).json<BingoGame>()
    ));

    const onCreateBoard = async () => {
        if(data) {
            const newBoard = await ky.post(`${config.backend}/games/${gameId}/boards`, {
                json: {
                    ...data.gameParams
                }
            }).json<CreatedBoard>();
            history.push(`/game/${gameId}/board/${newBoard.id}`)
        }
    }
    
    return (
        <main>
            { (!data || isValidating)
                ? <h1>Loading</h1>
                : (
                    <>
                        <h1>Joining { data!.name }</h1>
                        <button onClick={ onCreateBoard }>Create a board</button>
                    </>
                )
            }
        </main>
    )
}