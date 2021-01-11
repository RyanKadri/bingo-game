import { APIGatewayProxyHandlerV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { SubscribeCommand, UnsubscribeCommand, CallBingoCommand, BingoGame, BingoEvent } from "../../common/src/types/board";
import { useApiManagement, useClient } from "./dynamoClient";
import { GameService } from "./game-service";

const client = useClient();
const gameService = new GameService(client);

export const handleConnection: APIGatewayProxyHandlerV2 = async () => {
    return {
        statusCode: 200
    }
}

export const handleGameSubscription: APIGatewayProxyHandlerV2 = async (e) => {
    const subscription: SubscribeCommand = JSON.parse(e.body!);
    const connectionId: string = (e.requestContext as any).connectionId
    await gameService.registerSubscription(subscription.gameId, connectionId, subscription.asHost);
    await alertAllListeners(subscription.gameId, e.requestContext.apiId, {
        event: subscription.asHost ? "hostJoined" : "playerJoined",
        connectionId
    })

    return {
        statusCode: 200
    }
}

export const handleGameUnsubscribe: APIGatewayProxyHandlerV2 = async (e) => {
    const subscription: UnsubscribeCommand = JSON.parse(e.body!);
    const connectionId: string = (e.requestContext as any).connectionId
    await gameService.unsubscribe(subscription.gameId, connectionId);
    await alertAllListeners(subscription.gameId, e.requestContext.apiId, {
        event: "playerLeft",
        connectionId
    });

    return {
        statusCode: 200
    }
}

export const handleBingo: APIGatewayProxyHandlerV2 = async (e) => {
    const bingoEvent: CallBingoCommand = JSON.parse(e.body!);
    const game = await gameService.fetchGame(bingoEvent.gameId);
    await alertAllListeners(game, e.requestContext.apiId, {
        event: "bingo"
    })

    return {
        statusCode: 200
    }
}

async function alertAllListeners(gameOrId: string | BingoGame, apiId: string, event: BingoEvent) {
    const managementClient = useApiManagement(apiId);
    let game: BingoGame;
    if(typeof gameOrId === "string") {
        game = await gameService.fetchGame(gameOrId);
    } else {
        game = gameOrId;
    }

    const listeners: string[] = ((game.listeners as any).values ?? []).slice();
    if(game.hostConnection) {
        listeners.push(game.hostConnection)
    }

    await Promise.all(listeners.map((listener) => (
        managementClient.postToConnection({ 
            ConnectionId: listener,
            Data: JSON.stringify(event)
        }).promise()
          .catch(() => {
              // TODO should I unsubscribe here?
           })
    )))
}