import React from "react";
import { Header, List } from "semantic-ui-react";
import { BoardParams } from "../../../../common/src/types/types";
import { CalledNumber } from "../../components/LastNumberDisplay";

interface Props {
    calledNumbers: number[];
    gameParams: BoardParams
}
export function CallHistory({ calledNumbers, gameParams }: Props) {
    return (
        <>
            <Header>Called Numbers</Header>
            <List>
                { calledNumbers.slice().reverse().map(num => (
                    <List.Item key={ num }>
                        <CalledNumber num={ num } gameParams={ gameParams } />
                    </List.Item>
                ))}
            </List>
        </>    
    )
}