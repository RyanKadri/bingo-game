import { BingoCalled, BingoCommand, BingoEvent, GameSync, PlayerJoined } from "../../../common/src/types/types";
import { config } from "../utils/config";

export class BingoEventService {
    
    private ws: WebSocket | null = null;
    private initializingWs: WebSocket | null = null;
    private eventHandlers = new Map<BingoEvent["event"], ((e: BingoEvent) => void)[]>()
    private connectPromise: Promise<void> | null = null;

    connect() {
        if(!!this.connectPromise) {
            return this.connectPromise;
        } else {
            this.initializingWs = new WebSocket(config.websocket);
            
            this.initializingWs.addEventListener("close", () => {
                console.log("WebSocket closed");
                this.ws = null;
                this.initializingWs = null;
                this.connectPromise = null;
            });

            this.initializingWs.addEventListener("message", (e) => {
                const event: BingoEvent = JSON.parse(e.data);
                const handlers = this.eventHandlers.get(event.event) ?? [];
                handlers.forEach(handler => {
                    handler(event);
                })
            });

            this.connectPromise = new Promise<void>((res) => {
                this.initializingWs!.addEventListener("open", () => {
                    console.log("WebSocket connected");
                    this.ws = this.initializingWs;
                    this.initializingWs = null;
                    res();
                });
            });
            return this.connectPromise;
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        } else if (this.initializingWs) {
            this.initializingWs.close();
        }
    }

    registerPlayer(playerId: string) {
        this.sendCommand({ event: "registerConnection", playerId })
    }

    subscribeToGame(gameId: string, playerId: string, playerName: string, asHost = false) {
        this.sendCommand({ event: "subscribe", gameId, playerId, playerName, asHost });
    }

    unsubscribe(gameId: string, playerId: string, playerName: string, asHost = false) {
        this.sendCommand({ event: "unsubscribe", gameId, playerId, playerName, asHost })
    }

    callBingo(gameId: string, boardId: string, playerId: string, playerName: string) {
        this.sendCommand({ 
            event: "bingo", 
            gameId, 
            call: {
                boardId,
                playerId,
                playerName
            } })
    }

    onBingo(cb: (e: BingoCalled) => void) {
        const oldHandlers = this.eventHandlers.get("bingo") ?? [];
        this.eventHandlers.set("bingo", [...oldHandlers, cb as any]);
    }

    onGameSync(cb: (e: GameSync) => void) {
        const oldHandlers = this.eventHandlers.get("gameSync") ?? [];
        this.eventHandlers.set("gameSync", [...oldHandlers, cb as any]);
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