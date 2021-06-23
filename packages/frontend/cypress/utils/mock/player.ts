import { deepMerge, DeepPartial } from "./mock";
import { Player } from "../../../../common/src/types/types"

export function mockPlayer(overrides: DeepPartial<Player> = {}) {
    return deepMerge({
        name: "Test123",
        id: "pabc123",
        connectionId: "BW6E5ctKoAMCJGw=",
        games: []
    }, overrides)
}