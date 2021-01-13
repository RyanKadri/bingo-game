import { assertExists } from "../../../common/src/utils/utils";

export const playerTable = assertExists(
    process.env.BINGO_PLAYER_DYNAMO_TABLE,
    "Expected player table to be set"
);

export const gameTable = assertExists(
    process.env.BINGO_GAME_DYNAMO_TABLE,
    "Expected game table to be set"
);

export const boardTable = assertExists(
    process.env.BINGO_BOARD_DYNAMO_TABLE,
    "Expected board table to be set"
);