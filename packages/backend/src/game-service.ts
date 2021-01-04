import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { BingoGame, BoardParams } from "../../common/src/types/board";
import { assertExists } from "../../common/src/utils/utils";
import { shortUID } from "./utils/utils";

const gameTable = assertExists(
    process.env.BINGO_GAME_DYNAMO_TABLE,
    "Expected game table to be set"
);

export class GameService {
    constructor(
        private client: DocumentClient
    ){}

    async saveGame(boardParams: BoardParams) {
        const game: BingoGame = {
            id: shortUID(),
            gameParams: boardParams,
            calledNumbers: [],
            boards: []
        }
        
        await this.client.put({ 
            TableName: gameTable,
            Item: game
        }).promise();

        return game;
    }

    fetchBoard(boardId: string) {
        return this.client.get({
            TableName: gameTable,
            Key: {
                id: boardId
            }
        }).promise();
    }

    registerBoard(gameId: string, boardId: string) {
        return this.client.update({
            TableName: gameTable,
            Key: { id: gameId },
            UpdateExpression: "set #boards = list_append(#board, :boardId)",
            ExpressionAttributeNames: {
              "#boards": "boards"
            },
            ExpressionAttributeValues: {
              ":boardId": [boardId]
            }
        }).promise()
    }
}