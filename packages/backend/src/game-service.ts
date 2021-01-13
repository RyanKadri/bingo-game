import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { BingoGame, NewBingoGame } from "../../common/src/types/board";
import { gameTable } from "./utils/config";
import { shortUID } from "./utils/utils";

export class GameService {
    constructor(
        private client: DocumentClient
    ){}

    async saveGame(newGame: NewBingoGame) {
        const game: BingoGame = {
            id: shortUID(),
            name: newGame.name,
            gameParams: newGame.gameParams,
            calledNumbers: [],
            boards: []
        }
        
        await this.client.put({ 
            TableName: gameTable,
            Item: game
        }).promise();

        return game;
    }

    async updateGame(updatedBoard: Pick<BingoGame, "id" | "calledNumbers">) {
        await this.client.update({
            TableName: gameTable,
            Key: { id: updatedBoard.id },
            UpdateExpression: "set #calledNumbers = :numbers",
            ExpressionAttributeNames: {
              "#calledNumbers": "calledNumbers"
            },
            ExpressionAttributeValues: {
              ":numbers": updatedBoard.calledNumbers
            }
        }).promise();

        return updatedBoard;
    }

    async registerSubscription(gameId: string, connectionId: string, playerId?: string, playerName?: string) {
        const toAdd = ["listeners :connectionId"];
        if(playerId) {
            toAdd.push("playerIds :playerId");
        }
        if(playerName) {
            toAdd.push("playerNames :playerName");
        }
        await this.client.update({
            TableName: gameTable,
            Key: { id: gameId },
            UpdateExpression: `ADD ${ toAdd.join(", ") }`,
            ExpressionAttributeValues: {
                ":connectionId": this.client.createSet([connectionId]),
                ":playerId": playerId ? this.client.createSet([playerId]) : undefined,
                ":playerName": playerName ? this.client.createSet([playerName]) : undefined
            }
        }).promise();
    }

    async unsubscribe(gameId: string, connectionId: string, playerId?: string, playerName?: string) {
        const toDelete = ["listeners :connectionId"];
        if(playerId) {
            toDelete.push("playerIds :playerId");
        }
        if(playerName) {
            toDelete.push("playerNames :playerName");
        }
        await this.client.update({
            TableName: gameTable,
            Key: { id: gameId },
            UpdateExpression: `DELETE ${ toDelete.join(", ") }`,
            ExpressionAttributeValues: {
              ":connectionId": this.client.createSet([connectionId]),
              ":playerId": playerId ? this.client.createSet([playerId]) : undefined,
              ":playerName": playerName ? this.client.createSet([playerName]) : undefined
            }
        }).promise();
    }

    async fetchGame(boardId: string): Promise<BingoGame> {
        const gameResp = await this.client.get({
            TableName: gameTable,
            Key: {
                id: boardId
            }
        }).promise();
        
        const game = gameResp.Item as BingoGame;

        const listeners: string[] = ((game.listeners as any)?.values ?? []).slice();
        const playerIds: string[] = ((game.playerIds as any)?.values ?? []).slice();
        const playerNames: string[] = ((game.playerNames as any)?.values ?? []).slice();

        return {
            ...game,
            listeners,
            playerIds,
            playerNames
        };
    }

    registerBoard(gameId: string, boardId: string) {
        return this.client.update({
            TableName: gameTable,
            Key: { id: gameId },
            UpdateExpression: "set boards = list_append(boards, :boardId)",
            ExpressionAttributeValues: {
              ":boardId": [boardId]
            }
        }).promise()
    }
}