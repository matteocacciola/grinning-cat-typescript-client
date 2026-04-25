/**
 * @file RabbitHoleEndpoint.ts
 *
 * Isomorphic implementation of the RabbitHoleEndpoint that works in both
 * Node.js (server) and browser (client) environments. This class handles
 * file uploads to the RabbitHole API with environment-specific file handling.
 */
import {AbstractEndpoint} from "./abstract";
import {isNodeEnvironment} from "../utils/environment";
import {FileSource, readFile, getFileName, getFileMimeType} from "../utils/file-reader";
import {AllowedMimeTypesOutput} from "../models/api/rabbitholes";

export class RabbitHoleEndpoint extends AbstractEndpoint {
    protected prefix = "/rabbithole";

    private throwError(fileSource: FileSource, error: any) {
        // Provide more helpful error messages based on environment
        if (!isNodeEnvironment() && typeof fileSource === "string") {
            throw new Error("In browser environments, fileSource must be a File object, not a file path string.");
        } else if (isNodeEnvironment() && typeof fileSource !== "string") {
            throw new Error("In Node.js environments, fileSource must be a file path string.");
        }
        throw error;
    }

    private async appendFileToForm(
        form: globalThis.FormData,
        fileSource: FileSource,
        formKey: string,
        fileName?: string | null
    ) {
        const fileData = await readFile(fileSource);
        const finalFileName = fileName || await getFileName(fileSource);
        const fileMimeType = await getFileMimeType(fileSource, finalFileName);

        const arrayBuffer = Buffer.isBuffer(fileData)
            ? fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength) as ArrayBuffer
            : await (fileData as Blob).arrayBuffer();

        form.append(formKey, new Blob([new Uint8Array(arrayBuffer)], { type: fileMimeType }), finalFileName);
    }

    private appendQueryDataToForm(form: globalThis.FormData, metadata?: Record<string, any> | null) {
        if (metadata) {
            form.append("metadata", JSON.stringify(metadata));
        }
    }

    private async submitForm(form: globalThis.FormData, url: string, agentId: string) {
        const response = await this.getHttpClient(agentId).post(url, form);
        return response.data;
    }

    /**
     * Posts a file to the RabbitHole API for ingestion into the RAG system.
     *
     * This method works in both Node.js and browser environments:
     * - In Node.js: Pass a file path string as `fileSource`
     * - In browser: Pass a File object as `fileSource`
     *
     * The file is uploaded to the RabbitHole server and processed asynchronously.
     * The Grinning Cat processes the injection in the background, and the client will be informed when processing
     * completes.
     *
     * @param fileSource The source of the file to upload:
     *                  - In Node.js: A string path to the file
     *                  - In browser: A File object
     * @param agentId ID of the agent to associate with this upload
     * @param chatId Optional ID of the chat to associate with this upload
     * @param fileName Optional custom name for the file. If not provided:
     *                - In Node.js: The basename of the file path is used
     *                - In browser: The name property of the File object is used
     * @param metadata Optional additional metadata to associate with the file
     *
     * @returns Promise resolving to the API response data
     *
     * @example Browser usage:
     * ```typescript
     * // In a Vue.js or React component
     * const fileInput = document.getElementById('fileInput');
     * const file = fileInput.files[0];
     * const response = await rabbitHoleEndpoint.postFile(file);
     * ```
     *
     * @example Node.js usage:
     * ```typescript
     * // In a Node.js application
     * const response = await rabbitHoleEndpoint.postFile('/path/to/document.pdf');
     * ```
     */
    async postFile(
        fileSource: FileSource,
        agentId: string,
        chatId?: string | null,
        fileName?: string | null,
        metadata?: Record<string, any> | null,
    ): Promise<any> {
        const form = new globalThis.FormData();
        const endpoint = chatId ? this.formatUrl(`/${chatId}`) : this.prefix;

        try {
            await this.appendFileToForm(form, fileSource, "file", fileName);
            this.appendQueryDataToForm(form, metadata);

            // Send the request
            return await this.submitForm(form, endpoint, agentId);
        } catch (error) {
            this.throwError(fileSource, error);
        }
    }

    /**
     * This method posts a number of files to the RabbitHole API. The files are uploaded to the RabbitHole server and
     * ingested into the RAG system.
     *
     * This method works in both Node.js and browser environments:
     * - In Node.js: Pass an array of file path strings as `fileSource`
     * - In browser: Pass an array of File objects as `fileSource`
     *
     * The files are then processed by the RAG system, and the results are stored in the RAG database. The files are
     * processed in a batch. The process is asynchronous.
     * The Grinning Cat processes the injection in the background, and the client will be informed at the end of the
     * process.
     *
     * @param fileSources The sources of the file to upload:
     *                  - In Node.js: An array of strings path to the file
     *                  - In browser: An array of File objects
     * @param agentId ID of the agent to associate with this upload
     * @param chatId Optional ID of the chat to associate with this upload
     * @param metadata Optional additional metadata to associate with the file
     *
     * @returns Promise resolving to the API response data
     *
     * @example Browser usage:
     * ```typescript
     * // In a Vue.js or React component
     * const fileInputs = document.getElementById('fileInput');
     * const files = fileInputs.files;
     * const response = await rabbitHoleEndpoint.postFiles(files);
     * ```
     *
     * @example Node.js usage:
     * ```typescript
     * // In a Node.js application
     * const response = await rabbitHoleEndpoint.postFiles(['/path/to/first/document.pdf', '/path/to/second/document.pdf']);
     * ```
     */
    async postFiles(
        fileSources: FileSource[],
        agentId: string,
        chatId?: string | null,
        metadata?: Record<string, any> | null,
    ): Promise<any> {
        const form = new globalThis.FormData();

        const endpoint = chatId ? this.formatUrl(`/batch/${chatId}`) : this.formatUrl("/batch");

        try {
            await Promise.all(fileSources.map(fileSource => this.appendFileToForm(form, fileSource, "files")));

            // Append additional query parameters
            this.appendQueryDataToForm(form, metadata);

            return await this.submitForm(form, endpoint, agentId);
        } catch (error) {
            this.throwError(fileSources[0], error);
        }
    }

    /**
     * This method posts a web URL to the RabbitHole API. The web URL is ingested into the RAG system. The web URL is
     * processed by the RAG system by Web scraping, and the results are stored in the RAG database. The process is
     * asynchronous.
     * The Grinning Cat processes the injection in the background, and the client will be informed at the end of the
     * process.
     *
     * @param webUrl The URL of the web page to be ingested.
     * @param agentId The ID of the agent to be used for the upload.
     * @param chatId Optional ID of the chat to associate with this upload.
     * @param metadata Additional metadata to be associated with the web URL.
     *
     * @returns The response from the RabbitHole API.
     */
    async postWeb(
        webUrl: string,
        agentId: string,
        chatId?: string | null,
        metadata?: Record<string, any> | null,
    ): Promise<any> {
        const payload: Record<string, any> = { url: webUrl };
        if (metadata) {
            payload["metadata"] = metadata;
        }

        const endpoint = chatId ? this.formatUrl(`/web/${chatId}`) : this.formatUrl("/web");

        const response = await this.getHttpClient(agentId).post(endpoint, payload);
        if (response.status !== 200) {
            throw new Error(`Failed to post data to ${endpoint}: ${response.statusText}`);
        }
        return response.data;
    }

    /**
     * This method posts a memory point. The memory point is ingested into the RAG system. The process is asynchronous.
     * The provided file must be in JSON format.
     * The Grinning Cat processes the injection in the background, and the client will be informed at the end of the
     * process.
     *
     * @param fileSource The source of the file to upload:
     *                  - In Node.js: A string path to the file
     *                  - In browser: A File object
     * @param agentId The ID of the agent to be used for the upload.
     * @param fileName The name of the file to be uploaded. If not provided, the name of the file will be used.
     *
     * @returns The response from the RabbitHole API.
     *
     * @example Browser usage:
     * ```typescript
     * // In a Vue.js or React component
     * const fileInput = document.getElementById('fileInput');
     * const file = fileInput.files[0];
     * const response = await rabbitHoleEndpoint.postMemory(file);
     * ```
     *
     * @example Node.js usage:
     * ```typescript
     * // In a Node.js application
     * const response = await rabbitHoleEndpoint.postMemory('/path/to/document.json');
     * ```
     */
    async postMemory(
        fileSource: FileSource,
        agentId: string,
        fileName?: string | null,
    ): Promise<any> {
        const form = new globalThis.FormData();

        try {
            await this.appendFileToForm(form, fileSource, "file", fileName);

            return this.submitForm(form, this.formatUrl("/memory"), agentId);
        } catch (error) {
            this.throwError(fileSource, error);
        }
    }

    /**
     * This method retrieves the allowed MIME types for the RabbitHole API. The allowed MIME types are the MIME types
     * that are allowed to be uploaded to the RabbitHole API. The allowed MIME types are returned in a list.
     *
     * @param agentId The ID of the agent to be used.
     *
     * @returns The allowed MIME types for the RabbitHole API.
     */
    async getAllowedMimeTypes(agentId: string): Promise<AllowedMimeTypesOutput> {
        return this.get<AllowedMimeTypesOutput>(this.formatUrl("/allowed-mimetypes"), agentId);
    }

    /**
     * This method retrieves the web sources for the RabbitHole API. The web sources are the web URLs that are allowed
     * to be uploaded to the RabbitHole API. The web sources are returned in a list.
     *
     * @param agentId The ID of the agent to be used.
     * @param chatId Optional ID of the chat to filter the web sources.
     *
     * @returns The URLs of the web sources for the RabbitHole API.
     */
    async getWebSources(agentId: string, chatId?: string | null): Promise<string[]> {
        return this.get<string[]>(this.formatUrl("/web"), agentId, null, null, chatId);
    }
}