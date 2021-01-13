import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { NewPlayer, RegisterPlayerConnection } from "../../common/src/types/board";
import { useClient } from "./dynamoClient";
import { GameService } from "./game-service";
import { PlayerService } from "./player-service";
import { withCors } from "./utils/utils";

const client = useClient();
const gameService = new GameService(client);
const playerService = new PlayerService(client, gameService);

export const connectWebSocket: APIGatewayProxyHandlerV2 = async () => {
    return {
        statusCode: 200
    }
}

export const updatePlayer: APIGatewayProxyHandlerV2 = async (e) => {
    const player: NewPlayer = JSON.parse(e.body!);

    const newPlayer = await playerService.savePlayer(player);
    return {
        statusCode: 200,
        body: JSON.stringify(newPlayer),
        ...withCors()
    }
}

export const fetchPlayer: APIGatewayProxyHandlerV2 = async (e) => {
    const player = await playerService.fetchPlayer(e.pathParameters!.playerId!);

    return {
        statusCode: !!player ? 200 : 404,
        body: JSON.stringify(player),
        ...withCors()
    }
}

export const disconnectPlayer: APIGatewayProxyHandlerV2 = async (e) => {
    await playerService.disconnectPlayer((e.requestContext as any).connectionId);

    return {
        statusCode: 200
    }
}

export const connectPlayer: APIGatewayProxyHandlerV2 = async (e) => {
    const connectCommand = JSON.parse(e.body!) as RegisterPlayerConnection;
    await playerService.connectPlayer(connectCommand.playerId, (e.requestContext as any).connectionId);

    return {
        statusCode: 200
    }
}