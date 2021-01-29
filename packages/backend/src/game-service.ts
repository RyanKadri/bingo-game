import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { BingoCall, BingoGame, NewBingoGame } from "../../common/src/types/types";
import { gameTable } from "./utils/config";
import { bundlePlayerInfo, shortUID, unbundlePlayerInfo } from "./utils/utils";

export class GameService {
    constructor(
        private client: DocumentClient
    ){}

    async createGame(newGame: NewBingoGame) {
        const game: Partial<BingoGame> = {
            id: shortUID(),
            name: newGame.name,
            gameParams: newGame.gameParams,
            calledNumbers: [],
            boards: [],
            bingoCalls: [],
            createdDate: Date.now()
        }
        
        await this.client.put({ 
            TableName: gameTable,
            Item: game
        }).promise();

        return game;
    }

    async updateCalledNumbers(updatedBoard: Pick<BingoGame, "id" | "calledNumbers">) {
        const addedNumber = updatedBoard.calledNumbers[updatedBoard.calledNumbers.length - 1];
        const updated = await this.client.update({
            TableName: gameTable,
            Key: { id: updatedBoard.id },
            UpdateExpression: "set calledNumbers = list_append(calledNumbers, :number)",
            ExpressionAttributeValues: {
              ":number": [addedNumber]
            },
            ReturnValues: "ALL_NEW"
        }).promise();

        const game = this.normalizeGame(updated.Attributes as BingoGame);
        return {
            id: game.id,
            calledNumbers: game.calledNumbers
        }
    }

    async registerBingo(gameId: string, call: BingoCall) {
        const updated = await this.client.update({
            TableName: gameTable,
            Key: { id: gameId },
            UpdateExpression: "set bingoCalls = list_append(bingoCalls, :call)",
            ExpressionAttributeValues: {
              ":call": [call]
            },
            ReturnValues: "ALL_NEW"
        }).promise();

        const game = this.normalizeGame(updated.Attributes as BingoGame);
        return {
            id: game.id,
            bingoCalls: game.bingoCalls
        }
    }

    async registerSubscription(gameId: string, connectionId: string, playerId: string, playerName: string) {
        const toAdd = ["listeners :connectionId"];
        const playerInfo = bundlePlayerInfo(playerName, playerId)
        toAdd.push("playerInfo :playerInfo");

        const updateRes = await this.client.update({
            TableName: gameTable,
            Key: { id: gameId },
            UpdateExpression: `ADD ${ toAdd.join(", ") }`,
            ExpressionAttributeValues: {
                ":connectionId": this.client.createSet([connectionId]),
                ":playerInfo": this.client.createSet([playerInfo]),
            },
            ReturnValues: "ALL_NEW"
        }).promise();

        const game = this.normalizeGame(updateRes.Attributes as BingoGame);
        return {
            id: game.id,
            listeners: game.listeners,
            players: game.players
        }
    }

    async unsubscribe(gameId: string, connectionId: string, playerId: string, playerName: string) {
        const toDelete = ["listeners :connectionId"];
        const playerInfo = bundlePlayerInfo(playerName, playerId);
        toDelete.push("playerInfo :playerInfo");

        const updateRes = await this.client.update({
            TableName: gameTable,
            Key: { id: gameId },
            UpdateExpression: `DELETE ${ toDelete.join(", ") }`,
            ExpressionAttributeValues: {
              ":connectionId": this.client.createSet([connectionId]),
              ":playerInfo": this.client.createSet([playerInfo]),
            }
        }).promise();

        const game = this.normalizeGame(updateRes.Attributes as BingoGame);
        return {
            id: game.id,
            listeners: game.listeners,
            players: game.players
        }
    }

    async fetchGame(boardId: string): Promise<BingoGame> {
        const gameResp = await this.client.get({
            TableName: gameTable,
            Key: {
                id: boardId
            }
        }).promise();
        
        const game = gameResp.Item as BingoGame;

        return this.normalizeGame(game);
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

    private normalizeGame(game: BingoGame): BingoGame {
        const listeners: string[] = ((game.listeners as any)?.values ?? []).slice();
        const encodedPlayerInfo: string[] = ((game as any)?.playerInfo?.values ?? []).slice();
        const players = encodedPlayerInfo.map(info => unbundlePlayerInfo(info));

        return {
            ...game,
            listeners,
            players: players
        };
    }
}