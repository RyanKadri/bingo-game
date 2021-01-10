import { APIGatewayProxyHandlerV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { useApiManagement, useClient } from "./dynamoClient";
import { GameService } from "./game-service";

const client = useClient();
const gameService = new GameService(client);

interface GameSubscriptionEvent {
    event: "subscribe";
    gameId: string;
}

interface GameUnsubscriptionEvent {
    event: "unsubscribe";
    gameId: string;
}

interface BingoEvent {
    event: "bingo";
    gameId: string;
}

export const handleConnection: APIGatewayProxyHandlerV2 = async () => {
    return {
        statusCode: 200
    }
}

export const handleGameSubscription: APIGatewayProxyHandlerV2 = async (e) => {
    const subscription: GameSubscriptionEvent = JSON.parse(e.body!);
    await gameService.registerSubscription(subscription.gameId, (e.requestContext as any).connectionId);

    return {
        statusCode: 200
    }
}

export const handleGameUnsubscribe: APIGatewayProxyHandlerV2 = async (e) => {
    const subscription: GameUnsubscriptionEvent = JSON.parse(e.body!);
    await gameService.unsubscribe(subscription.gameId, (e.requestContext as any).connectionId);

    return {
        statusCode: 200
    }
}

export const handleBingo: APIGatewayProxyHandlerV2 = async (e) => {
    const bingoEvent: BingoEvent = JSON.parse(e.body!);
    const game = await gameService.fetchGame(bingoEvent.gameId);
    const managementClient = useApiManagement(e.requestContext.apiId);

    await Promise.all(((game.listeners as any)?.values as string[] ?? []).map((listener) => (
        managementClient.postToConnection({ 
            ConnectionId: listener,
            Data: JSON.stringify({
                event: "bingo"
            })
        }).promise()
          .catch(() => {
              // TODO should I unsubscribe here?
           })
    )))

    return {
        statusCode: 200
    }
}