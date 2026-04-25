import {AbstractEndpoint} from "./abstract";
import {ChatOutput} from "../models/api/messages";
import {Message} from "../models/dtos";
import {SocketError, SocketRequest} from "../models/socket";

export class MessageEndpoint extends AbstractEndpoint {
    /**
     * This endpoint sends a message to the agent identified by the agentId parameter. The message is sent via HTTP.
     *
     * @param message The message to send
     * @param agentId The ID of the agent to send the message to
     * @param userId The ID of the user sending the message
     * @param chatId The ID of the chat session (optional)
     *
     * @returns The response from the server
     */
    async sendHttpMessage(
        message: Message,
        agentId: string,
        userId: string,
        chatId?: string | null,
    ): Promise<ChatOutput> {
        return this.post<ChatOutput>(
            "/message",
            agentId,
            message.toJSON(),
            userId,
            chatId,
        );
    }

    /**
     * This endpoint sends a message to the agent identified by the agentId parameter. The message is sent via WebSocket.
     *
     * @param message The message to send
     * @param agentId The ID of the agent to send the message to
     * @param userId The ID of the user sending the message
     * @param chatId The ID of the chat session (optional)
     * @param closure A closure that is called when a non-chat message is received
     *
     * @returns The response from the server
     */
    async sendWebsocketMessage(
        message: Message,
        agentId: string,
        userId: string,
        chatId?: string | null,
        closure?: (content: Record<string, unknown>) => void | null
    ): Promise<ChatOutput> {
        const json = JSON.stringify(message.toJSON());
        if (!json) {
            throw new Error("Error encoding message");
        }

        const client = this.getWsClient(agentId, userId, chatId);

        return new Promise((resolve, reject) => {
            const onMessage = (data: SocketRequest) => {
                const content = data.toString();

                let parsed: Record<string, unknown>;
                try {
                    parsed = JSON.parse(content);
                } catch {
                    reject(new Error("Error parsing message: " + content));
                    cleanup();
                    return;
                }

                if (parsed.type !== "chat") {
                    closure?.(parsed);
                    return;
                }

                cleanup();
                try {
                    resolve(this.deserialize<ChatOutput>(parsed.content as string));
                } catch (error) {
                    reject(new Error("Error deserializing message: " + error));
                }
            };

            const onError = (error: SocketError) => {
                this.client.getWsClient().close();
                cleanup();
                reject(new Error("WebSocket error: " + error.description));
            };

            const cleanup = () => {
                client.removeListener("message", onMessage);
                client.removeListener("error", onError);
            };

            const sendMessage = () => {
                try {
                    client.send(json);
                } catch (error) {
                    this.client.getWsClient().close();
                    reject(new Error("WebSocket send error: " + error));
                }
            };

            if (client.isOpen()) {
                sendMessage();
            } else {
                client.once("open", sendMessage);
            }

            client.on("message", onMessage);
            client.on("error", onError);
        });
    }
}