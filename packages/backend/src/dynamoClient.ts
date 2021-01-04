import { DocumentClient } from "aws-sdk/clients/dynamodb";

let client: DocumentClient | null;

export function useClient() {
    if(client) {
        return client;
    } else {
        client = new DocumentClient();
        return client;
    }
}