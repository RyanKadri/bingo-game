import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { CreatedBoard, NewBoard } from "../../common/src/types/board";
import { assertExists } from "../../common/src/utils/utils";

const boardTable = assertExists(
    process.env.BINGO_BOARD_DYNAMO_TABLE,
    "Expected board table to be set"
);

export class BoardService {
    constructor(
        private client: DocumentClient
    ) {}

    async fetchBoard(boardId: string) {
        const resp = await this.client.get({
            TableName: boardTable,
            Key: { id: boardId }
        }).promise();
        return resp.Item;
    }

    async updateBoard(boardUpdate: CreatedBoard) {
        await this.client.put({
            TableName: boardTable,
            Item: boardUpdate,
        }).promise();
        return boardUpdate;
    } 
    
    saveBoard(newBoard: NewBoard) {
        return this.client.put({ 
            TableName: boardTable,
            Item: newBoard
        }).promise();
    }
}