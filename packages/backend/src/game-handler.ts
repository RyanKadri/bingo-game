import { APIGatewayProxyHandlerV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { BoardParams } from "../../common/src/types/board";
import { useClient } from "./dynamoClient";
import { GameService } from "./game-service";
import { withCors } from "./utils/utils";

const client = useClient();
const gameService = new GameService(client);

export const createGame: APIGatewayProxyHandlerV2 = async (e) => {
    const boardParams: BoardParams = JSON.parse(e.body!);

    const newGame = await gameService.saveGame(boardParams);
  
    return {
        statusCode: 200,
        body: JSON.stringify(newGame),
        ...withCors()
    }
}

export const fetchGame: APIGatewayProxyHandlerV2 = async (e) => {
    const game = await gameService.fetchBoard(e.pathParameters!.boardId!);

    return {
        statusCode: 200,
        body: JSON.stringify(game),
        ...withCors()
    }
}