import { DocumentClient } from "aws-sdk/clients/dynamodb";
import ManagementClient from "aws-sdk/clients/apigatewaymanagementapi";

let client: DocumentClient | null = null;
let managementClient: ManagementClient | null = null;

export function useClient() {
    if(!client) {
        client = new DocumentClient();
    }
    return client;
}

export function useApiManagement(api: string) {
    if(!managementClient) {
        managementClient = new ManagementClient({ 
            endpoint: `https://${api}.execute-api.${process.env.AWS_REGION}.amazonaws.com/dev`
        });
    }
    return managementClient;
}