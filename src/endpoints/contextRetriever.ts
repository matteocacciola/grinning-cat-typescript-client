import {AbstractEndpoint} from "./abstract";
import {FactoryObjectSettingOutput, FactoryObjectSettingsOutput} from "../models/api/factories";

export class ContextRetrieverEndpoint extends AbstractEndpoint {
    protected prefix = "/context_retriever";

    /**
     * This endpoint returns the settings of all context retrievers.
     *
     * @param agentId The ID of the agent to get the settings of
     *
     * @returns The settings of all the large language models
     */
    async getContextRetrieversSettings(agentId: string): Promise<FactoryObjectSettingsOutput> {
        const result = await this.get<FactoryObjectSettingsOutput>(
            this.formatUrl("/settings"),
            agentId
        );
        return FactoryObjectSettingsOutput.convertSchemes(result);
    }

    /**
     * This endpoint returns the settings of a specific context retriever.
     *
     * @param contextRetriever The name of the context retriever to get the settings of
     * @param agentId The ID of the agent to get the settings of
     *
     * @returns The settings of the context retriever
     */
    async getContextRetrieverSettings(contextRetriever: string, agentId: string): Promise<FactoryObjectSettingOutput> {
        const result = await this.get<FactoryObjectSettingOutput>(
            this.formatUrl(`/settings/${contextRetriever}`),
            agentId
        );
        return FactoryObjectSettingOutput.convertScheme(result);
    }

    /**
     * This endpoint updates the settings of a specific context retriever.
     *
     * @param contextRetriever The name of the context retriever to update the settings of
     * @param agentId The ID of the agent to update the settings of
     * @param values The new settings of the context retriever
     *
     * @returns The updated settings of the context retriever
     */
    async putLargeLanguageModelSettings(
        contextRetriever: string,
        agentId: string,
        values: Record<string, any>,
    ): Promise<FactoryObjectSettingOutput> {
        const result = await this.put<FactoryObjectSettingOutput>(
            this.formatUrl(`/settings/${contextRetriever}`),
            agentId,
            values,
        );
        return FactoryObjectSettingOutput.convertScheme(result);
    }
}