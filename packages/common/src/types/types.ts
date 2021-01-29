export interface BingoGame {
    id: string;
    createdDate: number;
    name: string;
    gameParams: BoardParams;
    calledNumbers: number[];
    boards: string[];
    players: Pick<Player, "id" | "name">[];
    listeners?: string[];
    bingoCalls: BingoCall[];
}

export interface BingoCall {
    playerName: string;
    playerId: string;
    boardId: string;
    callTime: number;
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

export interface NewPlayer {
    name: string;
    connectionId: string;
    games: string[];
}

export interface Player extends NewPlayer {
    id: string;
}

export type BingoCommand = SubscribeCommand | UnsubscribeCommand | CallBingoCommand | RegisterPlayerConnection;

export interface SubscribeCommand {
    event: "subscribe";
    gameId: string;
    playerId: string;
    playerName: string;
    asHost: boolean;
}

export interface UnsubscribeCommand {
    event: "unsubscribe";
    gameId: string;
    playerId: string;
    playerName: string;
    asHost: boolean;
}

export interface CallBingoCommand {
    event: "bingo";
    gameId: string;
    call: Omit<BingoCall, "callTime">;
}

export interface RegisterPlayerConnection {
    event: "registerConnection";
    playerId: string;
}

export type BingoEvent = BingoCalled | HostJoined | PlayerJoined | PlayerLeft | GameSync;

export interface BingoCalled {
    event: "bingo";
    call: BingoCall;
}

export interface PlayerJoined {
    event: "playerJoined";
    name: string;
}

export interface HostJoined {
    event: "hostJoined";
    connectionId: string;
}

export interface PlayerLeft {
    event: "playerLeft";
    name: string;
}

export interface GameSync {
    event: "gameSync";
    game: Partial<BingoGame> & Pick<BingoGame, "id">
}