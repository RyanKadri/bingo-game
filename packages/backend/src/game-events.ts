import { APIGatewayProxyHandlerV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { BingoEvent, BingoGame, CallBingoCommand, SubscribeCommand, UnsubscribeCommand } from "../../common/src/types/board";
import { useApiManagement, useClient } from "./dynamoClient";
import { GameService } from "./game-service";
import { PlayerService } from "./player-service";

const client = useClient();
const gameService = new GameService(client);
const playerService = new PlayerService(client, gameService);

export const handleGameSubscription: APIGatewayProxyHandlerV2 = async (e) => {
    const subscription: SubscribeCommand = JSON.parse(e.body!);
    const connectionId: string = (e.requestContext as any).connectionId
    const updatedGame = await gameService.registerSubscription(subscription.gameId, connectionId, subscription.playerId, subscription.playerName);
    await playerService.watchGame(subscription.playerId, subscription.gameId);

    if(subscription.playerName) {
        await alertAllListeners(subscription.gameId, e.requestContext.apiId, {
            event: "gameSync",
            game: updatedGame
        })
    }

    return {
        statusCode: 200
    }
}

export const handleGameUnsubscribe: APIGatewayProxyHandlerV2 = async (e) => {
    const subscription: UnsubscribeCommand = JSON.parse(e.body!);
    const connectionId: string = (e.requestContext as any).connectionId
    const game = await gameService.unsubscribe(subscription.gameId, connectionId, subscription.playerId, subscription.playerName);
    await playerService.unwatchGame(subscription.playerId, subscription.gameId);

    await alertAllListeners(subscription.gameId, e.requestContext.apiId, {
        event: "gameSync",
        game: game
    });

    return {
        statusCode: 200
    }
}

export const handleBingo: APIGatewayProxyHandlerV2 = async (e) => {
    const bingoEvent: CallBingoCommand = JSON.parse(e.body!);
    const game = await gameService.fetchGame(bingoEvent.gameId);
    await alertAllListeners(game, e.requestContext.apiId, {
        event: "bingo",
        calledBy: bingoEvent.calledBy
    });

    return {
        statusCode: 200
    }
}

export async function alertAllListeners(gameOrId: string | BingoGame, apiId: string, event: BingoEvent) {
    const managementClient = useApiManagement(apiId);
    let game: BingoGame;
    if(typeof gameOrId === "string") {
        game = await gameService.fetchGame(gameOrId);
    } else {
        game = gameOrId;
    }

    await Promise.all((game.listeners ?? []).map((listener) => (
        managementClient.postToConnection({ 
            ConnectionId: listener,
            Data: JSON.stringify(event)
        }).promise()
          .catch((e) => {
              console.error(`Connection: ${listener} failed: ${e.message}`)
           })
    )))
}