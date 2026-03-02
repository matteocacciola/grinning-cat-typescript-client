import {AbstractEndpoint} from "./abstract";
import {UserOutput} from "../models/api/users";

export class UsersEndpoint extends AbstractEndpoint {
    protected prefix = "/users";

    /**
     * This endpoint is used to create a new user in the system. The user is created with the specified username and
     * password. The user is assigned the specified permissions. The permissions are used to define the access rights
     * of the user in the system and are defined by the system administrator.
     *
     * @param agentId The ID of the agent.
     * @param username The username of the user.
     * @param password The password of the user.
     * @param permissions The permissions of the user.
     * @param metadata The metadata of the user.
     *
     * @returns The created user.
     */
    async postUser(
        agentId: string,
        username: string,
        password: string,
        permissions?: Record<string, string[]> | null,
        metadata?: Record<string, any> | null,
    ): Promise<UserOutput> {
        const payload = {
            username,
            password,
            ...permissions && {permissions: permissions},
            ...metadata && {metadata: metadata},
        };

        return this.post<UserOutput>(this.prefix, agentId, payload);
    }

    /**
     * This endpoint is used to get a list of users in the system. The list includes the username and the permissions of
     * each user. The permissions are used to define the access rights of the users in the system and are defined by the
     * system administrator.
     *
     * @param agentId The ID of the agent.
     *
     * @returns The list of users in the system.
     */
    async getUsers(agentId: string): Promise<UserOutput[]> {
        const endpoint = this.prefix;
        const response = await this.getHttpClient(agentId).get(endpoint);
        if (response.status !== 200) {
            throw new Error(`Failed to fetch data from ${endpoint}: ${response.statusText}`);
        }

        const users = response.data;
        return users.map((user: any) => this.deserialize<UserOutput>(JSON.stringify(user)));
    }

    /**
     * This endpoint is used to get a user in the system. The user is identified by the userId parameter, previously
     * provided by the Grinning Cat API when the user was created. The endpoint returns the username and the permissions
     * of the user. The permissions are used to define the access rights of the user in the system and are defined by
     * the system administrator.
     *
     * @param userId The ID of the user.
     * @param agentId The ID of the agent.
     *
     * @returns The user in the system.
     */
    async getUser(userId: string, agentId: string): Promise<UserOutput> {
        return this.get<UserOutput>(this.formatUrl(userId), agentId);
    }

    /**
     * The endpoint is used to update the user in the system. The user is identified by the userId parameter, previously
     * provided by the Grinning Cat API when the user was created. The endpoint updates the username, the password, and
     * the permissions of the user. The permissions are used to define the access rights of the user in the system and
     * are defined by the system administrator.
     *
     * @param userId The ID of the user.
     * @param agentId The ID of the agent.
     * @param username The username of the user.
     * @param password The password of the user.
     * @param permissions The permissions of the user.
     * @param metadata The metadata of the user.
     *
     * @returns The updated user.
     */
    async putUser(
        userId: string,
        agentId: string,
        username?: string | null,
        password?: string | null,
        permissions?: Record<string, string[]> | null,
        metadata?: Record<string, any> | null,
    ): Promise<UserOutput> {
        const payload: any = {
            ...username && {username: username},
            ...password && {password: password},
            ...permissions && {permissions: permissions},
            ...metadata && {metadata: metadata},
        };

        return this.put<UserOutput>(this.formatUrl(userId), agentId, payload);
    }

    /**
     * This endpoint is used to delete the user in the system. The user is identified by the userId parameter,
     * previously provided by the Grinning Cat API when the user was created.
     *
     * @param userId The ID of the user.
     * @param agentId The ID of the agent.
     *
     * @returns The deleted user.
     */
    async deleteUser(userId: string, agentId: string): Promise<UserOutput> {
        return this.delete<UserOutput>(this.formatUrl(userId), agentId);
    }
}