import ky from "ky";
import React, { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { config } from "../utils/config";
import useSWR from "swr";
import { BingoGame, NewBoard, Cell } from "../../../common/src/types/board";
import { BingoBoard } from "../components/BingoBoard";

function formTrackingBoard(gameInfo: BingoGame): NewBoard {
    const columns: Cell[][] = [];
    const numsPerColumn = gameInfo.gameParams.maxNumber / gameInfo.gameParams.letters.length;
    let colStart = 1;
    const selectedNumSet = new Set(gameInfo.calledNumbers);
    for(const _ of gameInfo.gameParams.letters) {
        const newColumn: Cell[] = [];
        for(let i = 0; i < numsPerColumn; i++) {
            const number = colStart + i;
            newColumn.push({
                number,
                type: "number",
                selected: selectedNumSet.has(number)
            });
        }
        columns.push(newColumn)
        colStart += numsPerColumn
    }
    return {
        columns,
        letters: gameInfo.gameParams.letters
    }
}

export function HostGameView() {

    const { gameId } = useParams<{ gameId: string }>();
    const backendURL = `${config.backend}/games/${gameId}`;

    const { data, error, isValidating } = useSWR<BingoGame>(backendURL, () => (
        ky.get(backendURL).json<BingoGame>()
    ));

    const [ trackingBoard, setTrackingBoard ] = useState<NewBoard | null>(null);

    useEffect(() => {
        if(data) {
            setTrackingBoard(formTrackingBoard(data))
        }
    }, [data]);

    return (
        <main>
            { isValidating
                ? <h1>Loading</h1>
                : (error || !data)
                    ? <h1>Error</h1>
                    : (
                        <>
                            <h1>Hosting game { data.name }</h1>
                            Join Link: 
                            <Link to={`/game/${gameId}`}>
                                { `${location.origin}/game/${gameId}` }
                            </Link>
                            { !!trackingBoard && <BingoBoard board={ trackingBoard } /> }
                        </>
                    )
            }
        </main>
    )
}