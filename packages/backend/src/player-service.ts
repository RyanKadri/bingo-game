import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 } from "uuid";
import { NewPlayer, Player } from "../../common/src/types/board";
import { GameService } from "./game-service";
import { playerTable } from "./utils/config";

export class PlayerService {
    constructor(
        private client: DocumentClient,
        private gameService: GameService
    ) { }

    async savePlayer(newPlayer: NewPlayer) {
        const player = {
            ...newPlayer,
            id: v4()
        };

        await this.client.put({
            TableName: playerTable,
            Item: player
        }).promise();

        return player;
    }

    async fetchPlayer(playerId: string) {
        const resp = await this.client.get({
            TableName: playerTable,
            Key: {
                id: playerId
            }
        }).promise();
        
        const player = resp.Item as Player;
        const games = ((player.games as any)?.values ?? []).slice();
        return {
            ...player,
            games
        }
    }

    async disconnectPlayer(connectionId: string) {
        const player = await this.fetchPlayerByConnection(connectionId);
        await Promise.all(player.games.map(game => 
            this.gameService.unsubscribe(game, connectionId)
        ));
        await this.client.update({
            TableName: playerTable,
            Key: { id: player.id },
            UpdateExpression: "REMOVE games"
        }).promise();
    }

    async connectPlayer(playerId: string, connectionId: string) {
        await this.client.update({
            TableName: playerTable,
            Key: { id: playerId },
            UpdateExpression: "SET connectionId = :connectionId",
            ExpressionAttributeValues: {
                ":connectionId": connectionId
            }
        }).promise()
    }

    async watchGame(playerId: string, gameId: string) {
        await this.client.update({
            TableName: playerTable,
            Key: { id: playerId },
            UpdateExpression: "ADD games :games",
            ExpressionAttributeValues: {
                ":games": this.client.createSet([ gameId ])
            }
        }).promise();
    }

    async unwatchGame(playerId: string, gameId: string) {
        await this.client.update({
            TableName: playerTable,
            Key: { id: playerId },
            UpdateExpression: "DELETE games :games",
            ExpressionAttributeValues: {
                ":games": this.client.createSet([ gameId ])
            }
        }).promise();
    }

    private async fetchPlayerByConnection(connectionId: string) {
        const res = await this.client.query({
            TableName: playerTable,
            IndexName: "bingo-players-by-connection",
            KeyConditionExpression: "connectionId = :connectionId",
            ExpressionAttributeValues: {
                ":connectionId": connectionId
            }
        }).promise();
        console.log(res.Items);
        const player = res.Items![0] as Player;

        const games: string[] = ((player.games as any)?.values ?? []).slice();
        return {
            ...player,
            games
        }
    }
}