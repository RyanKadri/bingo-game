import { NewBoard, BoardParams, Cell } from "../types/board";

export function randBetween(min: number, max: number) {
    const range = max - min + 1;
    return Math.floor(Math.random() * range) + min;
}

export function createBoard(params: BoardParams): NewBoard {
    const numColumns = params.letters.length;
    const numsPerColumn = params.maxNumber / numColumns;
    let currentMin = 1;
    const cells: Cell[][] = []
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
    return {
        columns: cells,
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