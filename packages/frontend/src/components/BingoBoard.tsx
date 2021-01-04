import { NewBoard, Cell } from "../../../common/src/types/board";
import styles from "./BingoBoard.module.css";
import c from "classnames";

interface Props {
    board: NewBoard;
    canSelect?: boolean;
    onCellSelect?: (cell: Cell) => void
}

function extractRows(board: NewBoard): Cell[][] {
    const rows: Cell[][] = [];
    for(let rowNum = 0; rowNum < board.columns[0].length; rowNum ++) {
        const row: Cell[] = [];
        for(const col of board.columns) {
            row.push(col[rowNum]);
        }
        rows.push(row);
    }
    return rows;
}

export function BingoBoard({ board, canSelect = false, onCellSelect = () => {} }: Props) {
    const rows = extractRows(board)

    return (
        <section>
            <table className={ c(styles.boardTable, { [styles.selectable]: canSelect }) }>
                <thead>
                    <tr>
                        { board.letters.split("").map(letter => (
                            <th key={letter}>{ letter }</th>
                        )) }
                    </tr>
                </thead>
                <tbody>
                    { rows.map((row, rowInd) => (
                        <tr key={ rowInd }>
                            {
                                row.map((cell, cellInd) => (
                                    <td key={ cellInd } className={ c({ [styles.selected]: cell.selected }) }>
                                        { cell.type === "free"
                                            ? "Free"
                                            : cell.number }
                                    </td>
                                ))
                            }
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    )
}