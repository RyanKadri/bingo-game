import { assertExists } from "../../../common/src/utils/utils";

export const config = {
    backend: assertExists(process.env.REACT_APP_BINGO_API, "REST backend must be configured!"),
    websocket: assertExists(process.env.REACT_APP_BINGO_WEBSOCKET, "Websocket backend must be configured!")
}