import ky from "ky";
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom";
import { BingoGame, NewBoard } from "../../../common/src/types/board";
import { createBoard } from "../../../common/src/utils/utils";
import { BingoBoard } from "../components/BingoBoard";
import { config } from "../utils/config";
import styles from "./CreateGameView.module.css";

const defaultGameName = "Bingo with Friends";

function defaultMaxNumber(numLetters: number) {
    return numLetters ** 2 * 3;
}

export function CreateGameView() {
    const [ gameLetters, setGameLetters ] = useState("BINGO");
    const [ maxNumber, setMaxNumber ] = useState(defaultMaxNumber(gameLetters.length));
    const [ freeCenter, setFreeCenter ] = useState(true);
    const [ gameName, setGameName ] = useState("");

    const [ exampleBoard, setExampleBoard ] = useState<NewBoard | null>(null);
    const history = useHistory();
    const evenRows = gameLetters.length % 2 === 0;

    useEffect(() => {
        setExampleBoard(
            createBoard({
                letters: gameLetters, 
                rows: gameLetters.length,
                maxNumber, 
                freeCenter: evenRows ? false : freeCenter
            })
        );
    }, [gameLetters, maxNumber, freeCenter, evenRows])

    const onUpdateLetters = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextVal = e.target.value;
        setGameLetters(nextVal.toUpperCase());
        setMaxNumber(defaultMaxNumber(nextVal.length));
    }

    const onUpdateMax = (e: React.ChangeEvent<HTMLInputElement>) => {
        const enteredNum = e.target.valueAsNumber;
        const safeMax = Math.round(enteredNum / gameLetters.length) * gameLetters.length;
        setMaxNumber(safeMax);
    }

    const onUpdateFreeCenter = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFreeCenter(e.target.checked);
    }

    const onCreateGame = async () => {
        const newGame: BingoGame = await ky.post(`${config.backend}/games`, { 
            json: {
                name: gameName || defaultGameName,
                gameParams: {
                    letters: gameLetters, 
                    rows: gameLetters.length,
                    maxNumber, 
                    freeCenter: evenRows ? false : freeCenter
                }
            }
        }).json();
        history.push(`/game/${newGame.id}/host`);
    }

    return (
        <main className={ styles.container }>
            <h1>Create a Bingo Game</h1>
            <form className={ styles.boardParams }>
                <label>Game Name:
                    <input type="text"
                           value={ gameName }
                           onChange={ e => setGameName(e.target.value) } />
                </label>
                <label>Game Letters:
                    <input type="text" 
                        value={ gameLetters }
                        onChange={ onUpdateLetters } />
                </label>
                <label>Maximum Number:
                    <input type="number" value={ maxNumber } 
                        step={ Math.max(gameLetters.length, 1) }
                        onChange={ onUpdateMax } />
                </label>
                <label>Free Center:
                    <input type="checkbox" 
                           checked={ evenRows ? false : freeCenter }
                           disabled={ evenRows }
                           onChange={ onUpdateFreeCenter } />
                </label>
                <button onClick={ onCreateGame } type="button">
                    Create Game
                </button>
            </form>
            { exampleBoard !== null && (
                <>
                    <h2>Sample Board</h2>
                    <BingoBoard board={ exampleBoard } />
                </>
            )}
        </main>
    )
}