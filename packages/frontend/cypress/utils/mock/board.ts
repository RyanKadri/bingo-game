import { Cell, CreatedBoard } from "../../../../common/src/types/types";
import { deepMerge, DeepPartial } from "./mock";

export function mockBoard(overrides: DeepPartial<CreatedBoard>) {
    return deepMerge({
        id: "babc123",
        letters: "BINGO",
        categories: [
            [3,10,11,4,2].map(c),
            [29,23,16,17,26].map(c),
            [c(39), c(44), f(), c(40), c(35)],
            [56,54,50,47,57].map(c),
            [64,72,74,62,61].map(c)
        ]
    }, overrides);
}

function c(num: number): Cell {
    return {
        type: "number",
        number: num,
        selected: false,
    }
}

function f(): Cell {
    return {
        type: "free",
        selected: false
    }
}