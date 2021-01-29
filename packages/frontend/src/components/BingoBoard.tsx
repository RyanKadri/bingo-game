import { NewBoard, Cell } from "../../../common/src/types/types";
import styles from "./BingoBoard.module.css";
import c from "classnames";
import { noop, transposeCells } from "../../../common/src/utils/utils";

interface Props {
    board: NewBoard;
    canSelect?: boolean;
    rowWise?: boolean;
    onCellSelect?: (col: number, row: number, cell: Cell) => void;
    className?: string;
}

interface DefaultedProps {
    board: NewBoard;
    canSelect: boolean;
    onCellSelect: (col: number, row: number, cell: Cell) => void;
}

export function BingoBoard({ 
    board, 
    canSelect = false, 
    onCellSelect = noop, 
    rowWise = false,
    className = "",
}: Props) {

    const selectHandler = canSelect ? onCellSelect : noop;
    return (
        <section className={ className }>
            <table className={ c(styles.boardTable, { [styles.selectable]: canSelect, [styles.rowWise]: rowWise }) }>
                { rowWise
                    ? <HorizontalBoard board={ board } canSelect={ canSelect } onCellSelect={ selectHandler } />
                    : <VerticalBoard board={ board } canSelect={ canSelect } onCellSelect={ selectHandler } />
                }
            </table>
        </section>
    )
}

function VerticalBoard({ board, onCellSelect}: DefaultedProps) {
    const rows = transposeCells(board);

    return (
        <>
        <thead>
            <tr>
                { board.letters.split("").map((letter, i) => (
                    <th key={letter + i}>{ letter }</th>
                )) }
            </tr>
        </thead>
        <tbody>
            { rows.map((row, rowInd) => (
                <tr key={ rowInd }>
                    {
                        row.map((cell, cellInd) => (
                            <td key={ cellInd } className={ c({ [styles.selected]: cell.selected }) }
                                onClick={ () => onCellSelect(cellInd, rowInd, cell) }>
                                { cell.type === "free"
                                    ? "Free"
                                    : cell.number }
                            </td>
                        ))
                    }
                </tr>
            ))}
        </tbody>
        </>
    )
}

function HorizontalBoard({ board, onCellSelect}: DefaultedProps) {
    return (
        <tbody>
            { board.categories.map((category, categoryInd) => (
                <tr key={ categoryInd }>
                    <th>{board.letters[categoryInd]}</th>
                    { category.map((cell, cellInd) => (
                        <td key={ cellInd } className={ c({ [styles.selected]: cell.selected }) }
                            onClick={ () => onCellSelect(categoryInd, cellInd, cell) }>
                            { cell.type === "free"
                                ? "Free"
                                : cell.number }
                        </td>
                    )) }
                </tr>
            )) }
        </tbody>
    )
}