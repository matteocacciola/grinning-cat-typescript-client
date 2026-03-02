import WebSocket from "isomorphic-ws";
import {Serializer} from "./serializer";
import {WSClient} from "./clients/wsclient";
import {HttpClient} from "./clients/httpclient";
import {camelToSnakeCase} from "./helpers";
import {Endpoints} from "./endpoints/types";
import {AdminsEndpoint} from "./endpoints/admins";
import {AuthEndpoint} from "./endpoints/auth";
import {AuthHandlerEndpoint} from "./endpoints/authHandler";
import {ChunkerEndpoint} from "./endpoints/chunker";
import {ConversationEndpoint} from "./endpoints/conversation";
import {CustomEndpoint} from "./endpoints/customEndpoint";
import {EmbedderEndpoint} from "./endpoints/embedder";
import {LargeLanguageModelEndpoint} from "./endpoints/largeLanguageModel";
import {MessageEndpoint} from "./endpoints/message";
import {PluginsEndpoint} from "./endpoints/plugins";
import {FileManagerEndpoint} from "./endpoints/fileManager";
import {UsersEndpoint} from "./endpoints/users";
import {UtilsEndpoint} from "./endpoints/utils";
import {RabbitHoleEndpoint} from "./endpoints/rabbitHole";
import {MemoryEndpoint} from "./endpoints/memory";
import {SocketError, SocketResponse} from "./models/socket";
import {VectorDatabaseEndpoint} from "./endpoints/vectorDatabase";
import {HealthCheckEndpoint} from "./endpoints/healthCheck";
import {AgenticWorkflowEndpoint} from "./endpoints/agenticWorkflow";

export class GrinningCatClient implements Endpoints {
    private readonly wsClient: WSClient;
    private readonly httpClient: HttpClient;
    private readonly serializer: Serializer;

    constructor(wsClient: WSClient, httpClient: HttpClient, token?: string) {
        this.wsClient = wsClient;
        this.httpClient = httpClient;

        if (token) {
            this.addToken(token);
        }

        this.serializer = new Serializer({
            nameConverter: camelToSnakeCase,
            enableCircularCheck: true
        });
    }

    public addToken(token: string): this {
        this.wsClient.setToken(token);
        this.httpClient.setToken(token);
        return this;
    }

    public getHttpClient(): HttpClient {
        return this.httpClient;
    }

    public getWsClient(): WSClient {
        return this.wsClient;
    }

    public getSerializer(): Serializer {
        return this.serializer;
    }

    public admins(): AdminsEndpoint {
        return new AdminsEndpoint(this);
    }

    public agenticWorkflow(): AgenticWorkflowEndpoint {
        return new AgenticWorkflowEndpoint(this);
    }

    public auth(): AuthEndpoint {
        return new AuthEndpoint(this);
    }

    public authHandler(): AuthHandlerEndpoint {
        return new AuthHandlerEndpoint(this);
    }

    public chunker(): ChunkerEndpoint {
        return new ChunkerEndpoint(this);
    }

    public conversation(): ConversationEndpoint {
        return new ConversationEndpoint(this);
    }

    public embedder(): EmbedderEndpoint {
        return new EmbedderEndpoint(this);
    }

    public fileManager(): FileManagerEndpoint {
        return new FileManagerEndpoint(this);
    }

    public largeLanguageModel(): LargeLanguageModelEndpoint {
        return new LargeLanguageModelEndpoint(this);
    }

    public memory(): MemoryEndpoint {
        return new MemoryEndpoint(this);
    }

    public message(): MessageEndpoint {
        return new MessageEndpoint(this);
    }

    public plugins(): PluginsEndpoint {
        return new PluginsEndpoint(this);
    }

    public rabbitHole(): RabbitHoleEndpoint {
        return new RabbitHoleEndpoint(this);
    }

    public users(): UsersEndpoint {
        return new UsersEndpoint(this);
    }

    public utils(): UtilsEndpoint {
        return new UtilsEndpoint(this);
    }

    public custom(): CustomEndpoint {
        return new CustomEndpoint(this);
    }

    public vectorDatabase(): VectorDatabaseEndpoint {
        return new VectorDatabaseEndpoint(this);
    }

    public healthCheck(): HealthCheckEndpoint {
        return new HealthCheckEndpoint(this);
    }

    /**
     * Closes the WebSocket connection.
     * @returns The `GrinningCatClient` instance.
     */
    close(agentId: string, userId: string): GrinningCatClient {
        this.wsClient.getClient(agentId, userId).close();
        return this;
    }

    /**
     * Calls the handler when the WebSocket is connected
     * @param handler The function to call
     * @param agentId The agent ID to connect to
     * @param userId The user ID to connect to
     * @returns The current `GrinningCatClient` class instance
     */
    onConnected(handler: () => void, agentId: string, userId: string): GrinningCatClient {
        const wsClient = this.wsClient.getClient(agentId, userId);
        wsClient.on("open", () => {
            handler();
        });
        return this;
    }

    /**
     * Calls the handler when the WebSocket is disconnected
     * @param handler The function to call
     * @param agentId The agent ID to connect to
     * @param userId The user ID to connect to
     * @returns The current `GrinningCatClient` class instance
     */
    onDisconnected(handler: () => void, agentId: string, userId: string): GrinningCatClient {
        const wsClient = this.wsClient.getClient(agentId, userId);
        wsClient.on("close", () => {
            handler();
        });
        return this;
    }

    /**
     * Calls the handler when a new message arrives from the WebSocket
     * @param handler The function to call
     * @param agentId The agent ID to connect to
     * @param userId The user ID to connect to
     * @returns The current `GrinningCatClient` class instance
     */
    onMessage(handler: (data: SocketResponse) => void, agentId: string, userId: string): GrinningCatClient {
        const wsClient = this.wsClient.getClient(agentId, userId);
        wsClient.on("message", (data: SocketResponse) => {
            handler(data);
        });
        return this;
    }

    /**
     * Calls the handler when the WebSocket catches an exception
     * @param handler The function to call
     * @param agentId The agent ID to connect to
     * @param userId The user ID to connect to
     * @returns The current `GrinningCatClient` class instance
     */
    onError(
        handler: (error: SocketError, event?: WebSocket.ErrorEvent) => void,
        agentId: string,
        userId: string,
    ): GrinningCatClient {
        const wsClient = this.wsClient.getClient(agentId, userId);
        wsClient.on("error", (error: SocketError, event?: WebSocket.ErrorEvent) => {
            handler(error, event);
        });
        return this;
    }
}