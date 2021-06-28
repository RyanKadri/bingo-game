import { APIGatewayProxyHandlerV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { BingoGame, NewBingoGame } from "../../common/src/types/types";
import { useClient } from "./dynamoClient";
import { alertAllListeners } from "./game-events";
import { GameService } from "./game-service";
import { withStandardHeaders } from "./utils/utils";

const client = useClient();
const gameService = new GameService(client);

export const createGame: APIGatewayProxyHandlerV2 = async (e) => {
    const boardParams: NewBingoGame = JSON.parse(e.body!);

    const newGame = await gameService.createGame(boardParams);
    return {
        statusCode: 200,
        body: JSON.stringify(newGame),
        ...withStandardHeaders()
    }
}

export const fetchGame: APIGatewayProxyHandlerV2 = async (e) => {
    const game = await gameService.fetchGame(e.pathParameters!.gameId!);

    return {
        statusCode: !!game ? 200 : 404,
        body: JSON.stringify(game),
        ...withStandardHeaders()
    }
}

export const updateGame: APIGatewayProxyHandlerV2 = async (e) => {
    const boardUpdate: Pick<BingoGame, "calledNumbers" | "id"> = JSON.parse(e.body!)
    const update = await gameService.updateCalledNumbers(boardUpdate);
    
    const websocketBackend = process.env.WEBSOCKET_BACKEND_ID;
    await alertAllListeners(boardUpdate.id, websocketBackend ?? "<unknown>", {
        event: "gameSync",
        game: update
    });

    return {
        statusCode: 200,
        body: JSON.stringify(update),
        ...withStandardHeaders()
    }
}