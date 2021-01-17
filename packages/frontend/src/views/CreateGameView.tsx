import ky from "ky";
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom";
import { BingoGame, NewBoard } from "../../../common/src/types/board";
import { createBoard } from "../../../common/src/utils/utils";
import { BingoBoard } from "../components/BingoBoard";
import { config } from "../utils/config";
import styles from "./CreateGameView.module.css";
import { Header, Form, Divider } from "semantic-ui-react"

const defaultGameName = "Bingo with Friends";

function defaultMaxNumber(numLetters: number) {
    return numLetters ** 2 * 3;
}

export function CreateGameView() {
    const [ gameLetters, setGameLetters ] = useState("BINGO");
    const [ maxNumber, setMaxNumber ] = useState(defaultMaxNumber(gameLetters.length));
    const [ safeMax, setSafeMax ] = useState(maxNumber);
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
                maxNumber: safeMax, 
                freeCenter: evenRows ? false : freeCenter
            })
        );
    }, [gameLetters, safeMax, freeCenter, evenRows])

    const onUpdateLetters = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextVal = e.target.value;
        setGameLetters(nextVal.toUpperCase());
        const newMax = defaultMaxNumber(nextVal.length);
        setMaxNumber(newMax);
        setSafeMax(newMax);
    }

    const onUpdateMax = (e: React.ChangeEvent<HTMLInputElement>) => {
        const enteredNum = e.target.valueAsNumber;
        const safeMax = Math.round(enteredNum / gameLetters.length) * gameLetters.length;
        setMaxNumber(enteredNum);
        setSafeMax(safeMax);
    }

    const roundMax = () => {
        setMaxNumber(safeMax);
    }

    const onUpdateFreeCenter = (newVal: boolean) => {
        setFreeCenter(newVal);
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
            <section>
                <Header as="h1">Create a Bingo Game</Header>
                <Form>
                    <Form.Input label="Game Name" type="text" 
                                value={ gameName } onChange={ e => setGameName(e.target.value) }>
                    </Form.Input>
                    <Form.Input label="Board Letters" type="text"
                                value={ gameLetters } onChange={ onUpdateLetters }/>
                    <Form.Input label="Maximum Number" type="number"
                                value={ maxNumber }
                                min={ gameLetters.length ** 2 * 2 }
                                step={ Math.max(gameLetters.length, 1 )}
                                onBlur={ roundMax }
                                onChange={ onUpdateMax } />
                    <Form.Checkbox label="Free Center" checked={ evenRows ? false : freeCenter }
                            disabled={ evenRows }
                            onChange={ (_, val) => onUpdateFreeCenter(val.checked ?? false) } />
                    <Form.Button onClick={ onCreateGame } type="button" primary>
                        Create Game
                    </Form.Button>
                </Form>
            </section>
            <Divider className={ styles.divider }></Divider>
            { exampleBoard !== null && (
                <section>
                    <Header as="h2">Sample Board</Header>
                    <div className={ styles.boardBox }>
                        <BingoBoard board={ exampleBoard } />
                    </ div>
                </section>
            )}
        </main>
    )
}