import { NewBoard, BoardParams, Cell } from "../types/types";

export function randBetween(min: number, max: number) {
    const range = max - min + 1;
    return Math.floor(Math.random() * range) + min;
}

export function createBoard(params: BoardParams): NewBoard {
    const numColumns = params.letters.length;
    const numsPerColumn = params.maxNumber / numColumns;
    let currentMin = 1;
    const cells: Cell[][] = [];
    if(params.rows * numColumns <= params.maxNumber) {
        for(let i = 0; i < numColumns; i++) {
            const generatedNumbers = new Set<number>();
            // TODO - Maybe make this deterministic?
            while(generatedNumbers.size < params.rows) {
                const nextNum = randBetween(currentMin, currentMin + numsPerColumn - 1);
                generatedNumbers.add(nextNum);
            }
            cells.push(Array.from(generatedNumbers).map(num => ({ 
                number: num, 
                selected: false,
                type: "number"
            })));
            currentMin += numsPerColumn;
        }
        if(params.freeCenter) {
            const centerCol = Math.floor(params.letters.length / 2);
            const col = cells[centerCol]!;
            const centerRow = Math.floor(col.length / 2);
            col[centerRow] = { type: "free", selected: true }
        }
    }
    return {
        categories: cells,
        letters: params.letters
    }
}

export function assertExists<T>(thing: T | null | undefined, message: string): T {
    if(thing != null) {
        return thing;
    } else {
        throw new Error(message)
    }
}

export function transposeCells(board: NewBoard): Cell[][] {
    const rows: Cell[][] = [];
    if(board.categories.length === 0) { return rows }
    
    for(let rowNum = 0; rowNum < board.categories[0].length; rowNum ++) {
        const row: Cell[] = [];
        for(const col of board.categories) {
            row.push(col[rowNum]);
        }
        rows.push(row);
    }
    return rows;
}

export function noop() {}

export function pickRandomFrom<T>(things: T[]) {
    const ind = randBetween(0, things.length - 1);
    return things[ind];
}