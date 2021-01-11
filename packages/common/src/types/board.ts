export interface BingoGame {
    id: string;
    name: string;
    gameParams: BoardParams;
    calledNumbers: number[];
    boards: string[];
    hostConnection?: string;
    listeners?: string[];
}

export type NewBingoGame = Pick<BingoGame, "name" | "gameParams">;

export interface BoardParams {
    letters: string;
    maxNumber: number;
    rows: number;
    freeCenter: boolean;
}

export interface NewBoard {
    categories: Cell[][];
    letters: string;
}

export interface CreatedBoard extends NewBoard {
    id: string;
}

export type Cell = NumberCell | FreeCell;

interface FreeCell {
    type: "free";
    selected: boolean;
}

interface NumberCell {
    type: "number";
    number: number;
    selected: boolean;
}

export type BingoCommand = SubscribeCommand | UnsubscribeCommand | CallBingoCommand;

export interface SubscribeCommand {
    event: "subscribe";
    gameId: string;
    asHost: boolean;
}

export interface UnsubscribeCommand {
    event: "unsubscribe";
    gameId: string;
}

export interface CallBingoCommand {
    event: "bingo";
    gameId: string;
}

export type BingoEvent = BingoCalled | HostJoined | PlayerJoined | PlayerLeft;

export interface BingoCalled {
    event: "bingo";
}

export interface PlayerJoined {
    event: "playerJoined";
    connectionId: string;
}

export interface HostJoined {
    event: "hostJoined";
    connectionId: string;
}

export interface PlayerLeft {
    event: "playerLeft";
    connectionId: string;
}