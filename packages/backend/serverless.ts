import { Serverless } from "serverless/aws";

const dynamoEnvironment = {
  BINGO_GAME_DYNAMO_TABLE: "${ssm:bingo-game-table}",
  BINGO_BOARD_DYNAMO_TABLE: "${ssm:bingo-board-table}",
  BINGO_PLAYER_DYNAMO_TABLE: "${ssm:bingo-player-table}"
};

const config: Serverless = {
  service: "bingo-backend",
  frameworkVersion: "2",
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    httpApi: {
      cors: true
    },
    iamManagedPolicies: [
      "arn:aws:iam::307651132348:policy/bingo-tables"
    ],
    websocketsApiName: "bingo-websocket",
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
    },
    // customDomain: {
    //   domainName: "bingo-api.rk0.xyz",
    //   stage: "$default",
    //   certificateName: "*.rk0.xyz",
    //   createRoute53Record: false,
    //   autoDomain: true,
    //   apiType: "http",
    //   endpointType: "regional"
    // }
  }
}

module.exports = config;