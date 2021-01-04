import { v4 } from "uuid"

export function withCors(others: { [key: string]: string } = {}) {
    return { 
        headers: {
            "Access-Control-Allow-Origin": "*",
            ...others
        }
    }
}

export function shortUID() {
    const buff = Buffer.alloc(16);
    v4(undefined, buff);
    return buff.toString("base64")
        .replace(/\//g, ".")
        .replace(/=/g, "-")
        .replace(/\+/g, "_")
}