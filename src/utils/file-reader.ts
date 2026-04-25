/**
 * @file file-reader.ts
 *
 * Isomorphic (Node.js and browser) utilities for file operations.
 */

import { isNodeEnvironment } from "./environment";

/**
 * Type representing the source of a file, which differs by environment:
 * - In Node.js: A string path to the file
 * - In browser: A File object
 */
export type FileSource = string | File | Blob;

/**
 * Reads file content in an environment-appropriate way.
 *
 * @param fileSource The source of the file:
 *                  - In Node.js: A string path to the file
 *                  - In browser: A File or Blob object
 * @returns Promise resolving to the file buffer/blob
 * @throws Error if file reading fails or if using an inappropriate
 *         file source type for the current environment
 */
export async function readFile(fileSource: FileSource): Promise<Buffer | Blob> {
    // Node.js environment
    if (isNodeEnvironment()) {
        if (typeof fileSource !== "string") {
            throw new Error("In Node.js environment, fileSource must be a file path string");
        }

        try {
            // Dynamic import to avoid bundling issues in browser
            const { readFile } = await import("fs/promises");
            return await readFile(fileSource);
        } catch (error: any) {
            throw new Error(`Failed to read file at path ${fileSource}: ${error.message}`);
        }
    }

    // Browser environment
    if (typeof fileSource === "string") {
        throw new Error("In browser environment, fileSource must be a File or Blob object, not a path string");
    }

    // File or Blob are already the data we need
    return fileSource;
}

/**
 * Gets the appropriate filename from the file source based on the environment.
 *
 * @param fileSource The source of the file
 * @returns Promise resolving to the filename
 */
export async function getFileName(fileSource: FileSource): Promise<string> {
    // In Node.js, extract the basename from the path
    if (isNodeEnvironment()) {
        if (typeof fileSource !== "string") {
            throw new Error("Expected file path string in Node.js environment");
        }

        const path = await import("path");
        return path.basename(fileSource);
    }

    // In browser, use the name property of the File object
    if (fileSource instanceof File) {
        return fileSource.name;
    }
    if (fileSource instanceof Blob) {
        // For generic blobs, generate a name
        return `blob-${Date.now()}.bin`;
    }
    throw new Error("Expected File or Blob in browser environment");
}

export async function getFileMimeType(fileSource: FileSource, fileName: string): Promise<string> {
    // In Node.js, use the mime module to get the MIME type
    if (isNodeEnvironment()) {
        if (typeof fileSource !== "string") {
            throw new Error("Expected file path string in Node.js environment");
        }

        const { contentType } = await import("mime-types");
        return contentType(fileName) || "application/octet-stream";
    }

    // In browser, use the type property of the File object
    if (fileSource instanceof File || fileSource instanceof Blob) {
        return fileSource.type || "application/octet-stream";
    }
    throw new Error("Expected File or Blob in browser environment");
}