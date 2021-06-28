import { BingoGame } from "../../../../common/src/types/types";
import { deepMerge, DeepPartial } from "./mock";

export function mockGame(overrides: DeepPartial<BingoGame>) {
    return deepMerge({
        id: "gabc123",
        name: "CypressTest",
        createdDate: Date.now(),
        players: [],
        gameParams: {
            letters: "BINGO",
            rows: 5,
            maxNumber: 75,
            freeCenter: true,
            showBoards: true
        },
        calledNumbers: [],
        boards: [],
        bingoCalls: [],
        expirationDate: Date.now()
    }, overrides);
}