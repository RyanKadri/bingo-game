export interface BingoGame {
    id: string;
    name: string;
    gameParams: BoardParams;
    calledNumbers: number[];
    boards: string[];
}

export type NewBingoGame = Pick<BingoGame, "name" | "gameParams">;

export interface BoardParams {
    letters: string;
    maxNumber: number;
    rows: number;
    freeCenter: boolean;
}

export interface NewBoard {
    categories: Cell[][];
    letters: string;
}

export interface CreatedBoard extends NewBoard {
    id: string;
}

export type Cell = NumberCell | FreeCell;

interface FreeCell {
    type: "free";
    selected: boolean;
}

interface NumberCell {
    type: "number";
    number: number;
    selected: boolean;
}