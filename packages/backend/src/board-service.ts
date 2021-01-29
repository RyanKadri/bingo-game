import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { CreatedBoard, NewBoard } from "../../common/src/types/types";
import { boardTable } from "./utils/config";

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