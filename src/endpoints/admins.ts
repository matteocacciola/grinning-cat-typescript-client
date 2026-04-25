import {AbstractEndpoint} from "./abstract";
import {PluginCollectionOutput, PluginToggleOutput} from "../models/api/plugins";
import {FileSource, readFile} from "../utils/file-reader"; // File | Blob | string

export class AdminsEndpoint extends AbstractEndpoint {
    protected prefix = "/plugins";

    /**
     * This endpoint returns the available plugins, at a system level.
     *
     * @param pluginName The name of the plugin to search for.
     *
     * @returns The available plugins.
     */
    async getAvailablePlugins(pluginName?: string | null): Promise<PluginCollectionOutput> {
        const result = await this.get<PluginCollectionOutput>(
            this.formatUrl("/installed"),
            this.systemId,
            undefined,
            pluginName ? { query: pluginName } : undefined
        );

        return PluginCollectionOutput.convertTags(result);
    }

    // create a function to open a file and pass the file contents to postMultipart

    /**
     * This endpoint installs a plugin from a ZIP file.
     *
     * @param fileSource In Node.js: path string to the ZIP file. In browser: File or Blob object.
     *
     * @returns The output of the plugin installation.
     */
    async postInstallPluginFromZip(fileSource: FileSource): Promise<PluginCollectionOutput> {
        const fileData = await readFile(fileSource);

        const form = new FormData();

        let filename = "plugin.zip";
        let contentType = "application/octet-stream";

        if (typeof fileSource === "string") {
            filename = fileSource.split("/").pop() ?? "plugin.zip";
            const ext = filename.split(".").pop() ?? "";
            contentType = ext === "zip" ? "application/zip" : "application/octet-stream";
        } else if (fileSource instanceof File) {
            filename = fileSource.name;
            contentType = fileSource.type || "application/octet-stream";
        }

        const arrayBuffer = Buffer.isBuffer(fileData)
            ? fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength) as ArrayBuffer
            : await (fileData as Blob).arrayBuffer();

        form.append("file", new Blob([new Uint8Array(arrayBuffer)], { type: contentType }), filename);

        const endpoint = this.formatUrl("/install/upload");

        const response = await this.getHttpClient(this.systemId).post(endpoint, form);
        if (response.status !== 200) {
            throw new Error(`Failed to post data to ${endpoint}: ${response.statusText}`);
        }

        const result = this.deserialize<PluginCollectionOutput>(response.data);
        return PluginCollectionOutput.convertTags(result);
    }

    /**
     * This endpoint installs a plugin from the registry.
     *
     * @param url The URL of the plugin in the registry.
     *
     * @returns The output of the plugin installation.
     */
    async postInstallPluginFromRegistry(url: string): Promise<PluginCollectionOutput> {
        const result = await this.post<PluginCollectionOutput>(
            this.formatUrl("/install/registry"),
            this.systemId,
            { url },
        );
        return PluginCollectionOutput.convertTags(result);
    }

    /**
     * This endpoint retrieves the plugins settings, i.e. the default ones at a system level.
     *
     * @returns The plugins settings.
     */
    async getPluginsSettings(): Promise<PluginCollectionOutput> {
        const result = await this.get<PluginCollectionOutput>(
            this.formatUrl("/system/settings"),
            this.systemId,
        );
        return PluginCollectionOutput.convertTags(result);
    }

    /**
     * This endpoint retrieves the plugin settings, i.e. the default ones at a system level.
     *
     * @param pluginId The ID of the plugin.
     *
     * @returns The plugin settings.
     */
    async getPluginSettings(pluginId: string): Promise<PluginCollectionOutput> {
        const result = await this.get<PluginCollectionOutput>(
            this.formatUrl(`/system/settings/${pluginId}`),
            this.systemId,
        );
        return PluginCollectionOutput.convertTags(result);
    }

    /**
     * This endpoint retrieves the plugin details, at a system level.
     *
     * @param pluginId The ID of the plugin.
     *
     * @returns The plugin details.
     */
    async getPluginDetails(pluginId: string): Promise<PluginCollectionOutput> {
        const result = await this.get<PluginCollectionOutput>(
            this.formatUrl(`/system/details/${pluginId}`),
            this.systemId,
        );
        return PluginCollectionOutput.convertTags(result);
    }

    /**
     * This endpoint deletes a plugin, at a system level.
     *
     * @param pluginId The ID of the plugin.
     *
     * @returns The output of the plugin deletion.
     */
    async deletePlugin(pluginId: string): Promise<PluginCollectionOutput> {
        const result = await this.delete<PluginCollectionOutput>(
            this.formatUrl(`/uninstall/${pluginId}`),
            this.systemId,
        );
        return PluginCollectionOutput.convertTags(result);
    }

    /**
     * This endpoint toggles a plugin.
     *
     * @param pluginId - The ID of the plugin to toggle.
     *
     * @returns The plugin toggle output.
     */
    async putTogglePlugin(pluginId: string): Promise<PluginToggleOutput> {
        return this.put<PluginToggleOutput>(
            this.formatUrl(`/system/toggle/${pluginId}`),
            this.systemId,
        );
    }
}