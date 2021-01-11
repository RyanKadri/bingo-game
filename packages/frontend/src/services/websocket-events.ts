import { BingoCalled, BingoCommand, BingoEvent, PlayerJoined } from "../../../common/src/types/board";

export class BingoEventService {
    private ws: WebSocket | null = null;
    private initializingWs: WebSocket | null = null;
    private eventHandlers = new Map<BingoEvent["event"], ((e: BingoEvent) => void)[]>()

    connect() {
        this.initializingWs = new WebSocket(`${process.env.REACT_APP_BINGO_WEBSOCKET}`);
        
        this.initializingWs.addEventListener("close", () => {
            console.log("WebSocket closed");
            this.ws = null;
        });

        this.initializingWs.addEventListener("message", (e) => {
            const event: BingoEvent = JSON.parse(e.data);
            const handlers = this.eventHandlers.get(event.event) ?? [];
            handlers.forEach(handler => {
                handler(event);
            })
        });

        return new Promise<void>((res) => {
            this.initializingWs!.addEventListener("open", () => {
                console.log("WebSocket connected");
                this.ws = this.initializingWs;
                this.initializingWs = null;
                res();
            });
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        } else if (this.initializingWs) {
            this.initializingWs.close();
        }
    }

    subscribeToGame(gameId: string, asHost = false) {
        this.sendCommand({ event: "subscribe", gameId, asHost });
    }

    unsubscribe(gameId: string) {
        this.sendCommand({ event: "unsubscribe", gameId })
    }

    onBingo(cb: (e: BingoCalled) => void) {
        const oldHandlers = this.eventHandlers.get("bingo") ?? [];
        this.eventHandlers.set("bingo", [...oldHandlers, cb as any]);
    }

    onPlayerJoined(cb: (e: PlayerJoined) => void) {
        const oldHandlers = this.eventHandlers.get("playerJoined") ?? [];
        this.eventHandlers.set("playerJoined", [...oldHandlers, cb as any]);
    }

    onPlayerLeft(cb: (e: PlayerJoined) => void) {
        const oldHandlers = this.eventHandlers.get("playerLeft") ?? [];
        this.eventHandlers.set("playerLeft", [...oldHandlers, cb as any]);
    }

    private sendCommand(command: BingoCommand) {
        this.checkConnection(command.event);
        this.ws!.send(JSON.stringify(command))
    }

    private checkConnection(action: string) {
        if(!this.ws) {
            throw new Error(`Connection was lost. Could not ${action}`)
        }
    }
}