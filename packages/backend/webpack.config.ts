import { Configuration } from "webpack";
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");

const isLocal = slsw.lib.webpack.isLocal;

const config: Configuration = {
    mode: isLocal ? "development" : "production",
    entry: slsw.lib.entries,
    externals: [nodeExternals()],
    devtool: "source-map",
    target: "node",
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts"]
    },
    module: {
        rules: [
            { 
                test: /\.(ts|js)$/,
                exclude: /node_modules/,
                loader: "ts-loader"
            }
        ]
    }
}

module.exports = config;