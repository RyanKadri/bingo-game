import { Serverless } from "serverless/aws";

const dynamoEnvironment = {
  BINGO_GAME_DYNAMO_TABLE: "${ssm:bingo-game-table}",
  BINGO_BOARD_DYNAMO_TABLE: "${ssm:bingo-board-table}"
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
    ]
  },
  plugins: [
    "serverless-webpack"
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
    }
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