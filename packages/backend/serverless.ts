import { Serverless } from "serverless/aws";

const dynamoEnvironment = {
  BINGO_GAME_DYNAMO_TABLE: "${env:BINGO_GAME_DYNAMO_TABLE}",
  BINGO_BOARD_DYNAMO_TABLE: "${env:BINGO_BOARD_DYNAMO_TABLE}",
  BINGO_PLAYER_DYNAMO_TABLE: "${env:BINGO_PLAYER_DYNAMO_TABLE}",
  BINGO_GAME_TTL_DAYS: "${env:BINGO_GAME_TTL_DAYS}",
  BINGO_PLAYER_TTL_DAYS: "${env:BINGO_PLAYER_TTL_DAYS}",
  WEBSOCKET_BACKEND_ID: { "Ref": "WebsocketsApi" }
};

const config: Serverless = {
  service: "bingo-backend",
  frameworkVersion: "2",
  useDotenv: true,
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    httpApi: {
      cors: true
    },
    stage: "${opt:stage}",
    iam: {
      role: {
        managedPolicies: [
          "arn:aws:iam::307651132348:policy/${env:BINGO_DYNAMO_POLICY}"
        ],
      } 
    },
    websocketsApiName: "bingo-websocket-${opt:stage}",
    websocketsApiRouteSelectionExpression: "$request.body.event"
  },
  plugins: [
    "serverless-webpack",
  ],
  functions: {
    generateBoard: {
      handler: "src/board-handler.generateBoard",
      environment: { ... dynamoEnvironment },
      events: [
        {
          httpApi: {
            path: "/games/{gameId}/boards",
            method: "post"
          }
        },
      ]
    },
    fetchBoard: {
      handler: "src/board-handler.fetchBoard",
      environment: { ... dynamoEnvironment },
      events: [
        {
          httpApi: {
            path: "/boards/{boardId}",
            method: "get",
          }
        }
      ]
    },
    updateBoard: {
      handler: "src/board-handler.updateBoard",
      environment: { ...dynamoEnvironment },
      events: [
        {
          httpApi: {
            path: "/boards/{boardId}",
            method: "put"
          }
        }
      ]
    },
    createGame: {
      handler: "src/game-handler.createGame",
      environment: { ... dynamoEnvironment },
      events: [
        {
          httpApi: {
            path: "/games",
            method: "post",
          }
        }
      ]
    },
    updateGame: {
      handler: "src/game-handler.updateGame",
      environment: { ... dynamoEnvironment },
      events: [
        {
          httpApi: {
            path: "/games",
            method: "patch",
          }
        }
      ]
    },
    fetchGame: {
      handler: "src/game-handler.fetchGame",
      environment: { ... dynamoEnvironment },
      events: [
        {
          httpApi: {
            path: "/games/{gameId}",
            method: "get",
          }
        }
      ]
    },
    fetchPlayer: {
      handler: "src/player-handler.fetchPlayer",
      environment: { ...dynamoEnvironment },
      events: [
        { 
          httpApi: {
            path: "/players/{playerId}",
            method: "get"
          }
        }
      ]
    },
    savePlayer: {
      handler: "src/player-handler.updatePlayer",
      environment: { ...dynamoEnvironment },
      events: [
        { 
          httpApi: {
            path: "/players",
            method: "put"
          }
        }
      ]
    },
    connectManager: {
      handler: "src/player-handler.connectWebSocket",
      environment: { ... dynamoEnvironment },
      events: [
        { websocket: { route: "$connect" } },
      ]
    },
    connectionManager: {
      handler: "src/player-handler.disconnectPlayer",
      environment: { ...dynamoEnvironment },
      events: [
        { websocket: { route: "$disconnect" }}
      ]
    },
    handleBingo: {
      handler: "src/game-events.handleBingo",
      environment: { ...dynamoEnvironment },
      events: [
        { websocket: { route: "bingo" }}
      ]
    },
    handleSubscribe: {
      handler: "src/game-events.handleGameSubscription",
      environment: { ...dynamoEnvironment },
      events: [
        { websocket: { route: "subscribe" }}
      ]
    },
    handleUnsubscribe: {
      handler: "src/game-events.handleGameUnsubscribe",
      environment: { ...dynamoEnvironment },
      events: [
        { websocket: { route: "unsubscribe" }}
      ]
    },
    connectPlayer: {
      handler: "src/player-handler.connectPlayer",
      environment: { ...dynamoEnvironment },
      events: [
        { websocket: {route: "registerConnection" }}
      ]
    },
  },
  custom: {
    webpack: {
      webpackConfig: "webpack.config.ts",
      includeModules: true,
      forceExclude: ["aws-sdk"]
    }
  }
}

module.exports = config;