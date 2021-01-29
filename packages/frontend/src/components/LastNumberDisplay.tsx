import React from "react";
import { Label } from "semantic-ui-react";
import { BingoGame, BoardParams } from "../../../common/src/types/types";
import styles from "./LastNumberDisplay.module.css"

interface Props {
    gameData: BingoGame
}
export function LastNumberDisplay({ gameData }: Props) {
    const lastNumber = gameData.calledNumbers[gameData.calledNumbers.length -1]

    return (
        <div className={ styles.lastNumber }>
            Last Picked:&nbsp;
            <CalledNumber num={ lastNumber } gameParams={ gameData.gameParams }/>
        </div>
    )
}

interface CalledNumberProps {
    num: number;
    gameParams: BoardParams;
}
export function CalledNumber({ num, gameParams }: CalledNumberProps) {

    const colors = [
        'red',
        'green',
        'orange',
        'violet',
        'yellow',
        'olive',
        'teal',
        'blue',
        'purple',
        'pink',
        'brown',
        'grey',
        'black',
    ];

    const numberCol = Math.floor((num - 1) * gameParams.letters.length / gameParams.maxNumber)
    const letter = gameParams.letters[numberCol];

    return (
        <Label color={ colors[numberCol % colors.length] as any }>{ letter } - { num }</Label>
    )
}