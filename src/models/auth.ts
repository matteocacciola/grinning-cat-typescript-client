export type AuthResource = "CRUD" | "STATUS" | "MEMORY" | "CONVERSATION" | "SETTINGS" | "LLM" | "AUTH_HANDLER" | "USERS" | "UPLOAD" | "PLUGINS" | "STATIC"

export type AdminAuthResource = "ADMINS" | "EMBEDDER" | "FILE_MANAGER" | "CHESHIRE_CAT" | "PLUGINS"

export type AuthPermission = "WRITE" | "EDIT" | "LIST" | "READ" | "DELETE"