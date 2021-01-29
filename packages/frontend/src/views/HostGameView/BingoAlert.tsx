import React from "react";
import { Message, Modal } from "semantic-ui-react";
import { BingoCall, BingoGame } from "../../../../common/src/types/types";
import styles from "./BingoAlert.module.css";
import { BingoChecker } from "./BingoChecker";

interface Props {
    bingoCalls: BingoCall[];
    game: BingoGame;
}
export function BingoAlert({ bingoCalls, game }: Props) {
    return (
        <Message>
            <Message.Header>
                Bingo! { bingoCalls[0].playerName } 
                { bingoCalls.length > 1 
                    ? ` and ${ bingoCalls.length - 1 } other(s)`
                    : ""
                }
                &nbsp;called Bingo
            </Message.Header>
            <ul className={ styles.bingoCallerList }>
                { bingoCalls.map((call) => (
                    <li key={ call.playerId + call.callTime }>
                        { call.playerName }
                        { game.gameParams.showBoards && (
                            <Modal className={ styles.checkModal }
                                trigger={ 
                                    <button className={ styles.checkButton }>Check</button>
                                }
                            >
                                <BingoChecker call={ call } game={ game } />
                            </Modal>
                        )}
                    </li>
                )) }
            </ul>
        </Message>
    )
}