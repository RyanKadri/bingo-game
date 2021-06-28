import { APIGatewayProxyHandlerV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { BoardParams, CreatedBoard } from "../../common/src/types/types";
import { createBoard } from "../../common/src/utils/utils";
import { BoardService } from "./board-service";
import { useClient } from "./dynamoClient";
import { GameService } from "./game-service";
import { shortUID, withStandardHeaders } from "./utils/utils";

const client = useClient();
const gameService = new GameService(client)
const boardService = new BoardService(client);

export const generateBoard: APIGatewayProxyHandlerV2 = async event => {
    const boardParams: BoardParams = JSON.parse(event.body!);
    
    const newBoard = {
        id: shortUID(),
        ...createBoard(boardParams)
    };
    
    await Promise.all([
        boardService.saveBoard(newBoard),
        gameService.registerBoard(event.pathParameters!.gameId!, newBoard.id)
    ])
  
    return {
      statusCode: 200,
      body: JSON.stringify(newBoard),
      ...withStandardHeaders()
    };
};

export const fetchBoard: APIGatewayProxyHandlerV2 = async (e) => {
    const board = await boardService.fetchBoard(e.pathParameters!.boardId!);
    
    return {
        statusCode: !!board ? 200 : 404,
        body: JSON.stringify(board),
        ...withStandardHeaders()
    }
}

export const updateBoard: APIGatewayProxyHandlerV2 = async (e) => {
    const boardUpdate = JSON.parse(e.body!) as CreatedBoard;
    await boardService.updateBoard(boardUpdate);

    return {
        statusCode: 200,
        body: JSON.stringify(boardUpdate),
        ...withStandardHeaders()
    }
}