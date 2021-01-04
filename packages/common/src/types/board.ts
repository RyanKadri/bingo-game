export interface BingoGame {
    id: string;
    gameParams: BoardParams;
    calledNumbers: number[];
    boards: string[];
}

export interface BoardParams {
    letters: string;
    maxNumber: number;
    rows: number;
    freeCenter: boolean;
}

export interface Board {
    columns: Cell[][];
    letters: string;
}

export type Cell = NumberCell | FreeCell;

interface FreeCell {
    type: "free";
}

interface NumberCell {
    type: "number";
    number: number;
    selected: boolean;
}