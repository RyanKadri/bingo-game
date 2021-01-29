import classNames from "classnames";
import ky from "ky";
import { Header, Loader } from "semantic-ui-react";
import useSWR from "swr";
import { BingoCall, BingoGame, NewBoard } from "../../../../common/src/types/types";
import { BingoBoard } from "../../components/BingoBoard";
import { config } from "../../utils/config";
import styles from "./BingoChecker.module.css";

function generateExpectedBoard(board: NewBoard, game: BingoGame): NewBoard {
    const categories = [...board.categories.map(cat => [...cat])];
    const calledNumbers = new Set(game.calledNumbers);

    for(const category of categories) {
        for(const cell of category) {
            if(cell.type === "number" && calledNumbers.has(cell.number)) {
                cell.shouldBeSelected = true;
            } else if(cell.type === "free") {
                cell.shouldBeSelected = true;
            } else {
                cell.shouldBeSelected = false;
            }
        }
    }

    return {
        categories,
        letters: board.letters
    }
}

interface Props {
    call: BingoCall;
    game: BingoGame;
}
export function BingoChecker({ call, game }: Props) {

    const { data: boardData, isValidating } = useSWR(`${config.backend}/boards/${ call.boardId }`, (key) => {
        return ky.get(key).json<NewBoard>()
    });

    const expectedBoard = boardData ? generateExpectedBoard(boardData, game) : null;

    return (
        <div className={ styles.container }>
            <Header>Checking { call.playerName }'s Bingo</Header>
            { (isValidating && !boardData)
                ? <Loader content="Loading" />
                : expectedBoard && (
                    <BingoBoard canSelect={ false } board={ expectedBoard } showExpected={ true } showErrors={ true } />
                 )}
            <footer className={ styles.legend }>
                <div className={ styles.segment}>
                    <div className={ classNames(styles.legendMarker, styles.expected) } />
                    Correct
                </div>
                <div className={ styles.segment }>
                    <div className={ classNames(styles.legendMarker, styles.error) } />
                    Incorrect Selection
                </div>
            </footer>
        </div>
    )
}