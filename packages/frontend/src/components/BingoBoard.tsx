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
    showExpected?: boolean;
    showErrors?: boolean;
}

interface DefaultedProps {
    board: NewBoard;
    canSelect: boolean;
    showExpected: boolean;
    showErrors: boolean;
    onCellSelect: (col: number, row: number, cell: Cell) => void;
}

export function BingoBoard({ 
    board, 
    canSelect = false, 
    onCellSelect = noop, 
    rowWise = false,
    className = "",
    showExpected = false,
    showErrors = false
}: Props) {

    const selectHandler = canSelect ? onCellSelect : noop;
    
    return (
        <section className={ c(styles.boardContainer, className) }>
            <table className={ c(styles.boardTable, { [styles.selectable]: canSelect, [styles.rowWise]: rowWise }) }>
                { rowWise
                    ? <HorizontalBoard board={ board } 
                                       canSelect={ canSelect } 
                                       onCellSelect={ selectHandler } 
                                       showExpected={ showExpected }
                                       showErrors={ showErrors } />
                    : <VerticalBoard board={ board } 
                                     canSelect={ canSelect } 
                                     onCellSelect={ selectHandler } 
                                     showExpected={ showExpected }
                                     showErrors={ showErrors }/>
                }
            </table>
        </section>
    )
}

function VerticalBoard({ board, onCellSelect, showExpected, showErrors }: DefaultedProps) {
    const rows = transposeCells(board);
    const cellWidth = `${ 100 / Math.max(board.letters.length, 1) }`;
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
                            <td key={ cellInd } 
                                className={ c({ 
                                    [styles.selected]: showExpected ? cell.shouldBeSelected : cell.selected,
                                    [styles.incorrect]: !showErrors ? false : cell.selected && !cell.shouldBeSelected 
                                }) }
                                onClick={ () => onCellSelect(cellInd, rowInd, cell) }
                                style={ { width: cellWidth } }>
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
    const numCols = board.categories?.[0]?.length ?? 0;
    const cellWidth = `${ 100 / (numCols + 1) }%`;
    return (
        <tbody>
            { board.categories.map((category, categoryInd) => (
                <tr key={ categoryInd }>
                    <th style={{ width: cellWidth }}>
                        {board.letters[categoryInd]}
                    </th>
                    { category.map((cell, cellInd) => (
                        <td key={ cellInd } className={ c({ [styles.selected]: cell.selected }) }
                            onClick={ () => onCellSelect(categoryInd, cellInd, cell) }
                            style={{ width: cellWidth }}>
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