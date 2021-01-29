import React from "react";
import { Message } from "semantic-ui-react";
import { BingoCall } from "../../../../common/src/types/types";
import styles from "./BingoAlert.module.css";

interface Props {
    bingoCalls: BingoCall[];
}
export function BingoAlert({ bingoCalls }: Props) {
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
            <Message.List className={ styles.bingoCallerList }>
                { bingoCalls.map((call, i) => (
                    <Message.Item key={ call.playerId + call.callTime }>
                        { call.playerName }
                    </Message.Item>
                )) }
            </Message.List>
        </Message>
    )
}