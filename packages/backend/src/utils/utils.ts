import { v4 } from "uuid"

export function withStandardHeaders(others: { [key: string]: string } = {}) {
    return { 
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            ...others
        }
    }
}

export function shortUID() {
    const buff = Buffer.alloc(16);
    v4(undefined, buff);
    return buff.toString("base64")
        .replace(/\//g, ".")
        .replace(/=+$/g, "")
        .replace(/=/g, "-")
        .replace(/\+/g, "_")
}

export const infoDelimiter = "::";
export function bundlePlayerInfo(playerName: string, playerId: string) {
    return `${playerName}${infoDelimiter}${playerId}`
}

export function unbundlePlayerInfo(playerInfo: string) {
    const [name, id] = playerInfo.split(infoDelimiter);
    return {
        name,
        id
    }
}