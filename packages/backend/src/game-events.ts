import { APIGatewayProxyHandlerV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { BingoEvent, BingoGame, CallBingoCommand, CallCellCommand, SubscribeCommand, UnsubscribeCommand } from "../../common/src/types/board";
import { useApiManagement, useClient } from "./dynamoClient";
import { GameService } from "./game-service";
import { PlayerService } from "./player-service";

const client = useClient();
const gameService = new GameService(client);
const playerService = new PlayerService(client, gameService);

export const handleGameSubscription: APIGatewayProxyHandlerV2 = async (e) => {
    const subscription: SubscribeCommand = JSON.parse(e.body!);
    const connectionId: string = (e.requestContext as any).connectionId
    await gameService.registerSubscription(subscription.gameId, connectionId, subscription.playerId, subscription.playerName);
    await playerService.watchGame(subscription.playerId, subscription.gameId);

    if(subscription.playerName) {
        await alertAllListeners(subscription.gameId, e.requestContext.apiId, {
            event: "playerJoined",
            name: subscription.playerName
        })
    }

    return {
        statusCode: 200
    }
}

export const handleGameUnsubscribe: APIGatewayProxyHandlerV2 = async (e) => {
    const subscription: UnsubscribeCommand = JSON.parse(e.body!);
    const connectionId: string = (e.requestContext as any).connectionId
    await gameService.unsubscribe(subscription.gameId, connectionId, subscription.playerId, subscription.playerName);
    await playerService.unwatchGame(subscription.playerId, subscription.gameId);

    if(subscription.playerName) {
        await alertAllListeners(subscription.gameId, e.requestContext.apiId, {
            event: "playerLeft",
            name: subscription.playerName
        });
    }

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

export const handleCallCell: APIGatewayProxyHandlerV2 = async (e) => {
    const callCellEvent: CallCellCommand = JSON.parse(e.body!);
    const game = await gameService.fetchGame(callCellEvent.gameId);
    await alertAllListeners(game, e.requestContext.apiId, {
        event: "cellCalled",
        call: callCellEvent.call
    })
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
          .catch(() => {
              // TODO should I unsubscribe here?
           })
    )))
}