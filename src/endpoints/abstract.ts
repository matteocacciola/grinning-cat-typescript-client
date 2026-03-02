import {GrinningCatClient} from "../client";
import {WebSocketClient} from "../clients/wsclient";
import {AxiosInstance} from "axios";

export abstract class AbstractEndpoint {
    protected client: GrinningCatClient;
    protected prefix: string;
    protected systemId: string = "system";

    constructor(client: GrinningCatClient) {
        this.client = client;
    }

    protected formatUrl(endpoint: string): string {
        return `/${this.prefix}/${endpoint}`.replace(/\/+/g, "/");
    }

    protected getHttpClient(agentId?: string | null, userId?: string | null, chatId?: string | null): AxiosInstance {
        return this.client.getHttpClient().getClient(agentId, userId, chatId);
    }

    protected getWsClient(agentId: string, userId: string, chatId?: string | null): WebSocketClient {
        return this.client.getWsClient().getClient(agentId, userId, chatId);
    }

    protected deserialize<T>(data: string): T {
        return this.client.getSerializer().deserialize<T>(data);
    }

    protected async get<T>(
        endpoint: string,
        agentId: string | null,
        userId?: string | null,
        query?: any,
        chatId?: string | null,
    ): Promise<T> {
        const options: any = {};
        if (query) {
            options.query = query;
        }

        const response = await this.getHttpClient(agentId, userId, chatId).get(endpoint, options);
        if (response.status !== 200) {
            throw new Error(`Failed to fetch data from ${endpoint}: ${response.statusText}`);
        }
        return this.deserialize<T>(response.data);
    }

    protected async post<T>(
        endpoint: string,
        agentId: string,
        payload?: any,
        userId?: string | null,
        chatId?: string | null,
    ): Promise<T> {
        const options: any = {};
        if (payload) {
            options.json = payload;
        }

        const response = await this.getHttpClient(agentId, userId, chatId).post(endpoint, options);
        if (response.status !== 200) {
            throw new Error(`Failed to post data to ${endpoint}: ${response.statusText}`);
        }
        return this.deserialize<T>(response.data);
    }

    protected async put<T>(
        endpoint: string,
        agentId: string,
        payload?: any,
        userId?: string | null,
        chatId?: string | null,
    ): Promise<T> {
        const options: any = {};
        if (payload) {
            options.json = payload;
        }

        const response = await this.getHttpClient(agentId, userId, chatId).put(endpoint, options);
        if (response.status !== 200) {
            throw new Error(`Failed to put data to ${endpoint}: ${response.statusText}`);
        }
        return this.deserialize<T>(response.data);
    }

    protected async delete<T>(
        endpoint: string,
        agentId: string,
        userId?: string | null,
        payload?: any,
        chatId?: string | null,
    ): Promise<T> {
        const options: any = {};
        if (payload) {
            options.json = payload;
        }

        const response = await this.getHttpClient(agentId, userId, chatId).delete(endpoint, options);
        if (response.status !== 200) {
            throw new Error(`Failed to delete data from ${endpoint}: ${response.statusText}`);
        }
        return this.deserialize<T>(response.data);
    }
}