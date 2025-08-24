export { Agent } from "./core/agent"
export type { AgentConfig, DefaultRuntimeExtension } from "./core/agent"
export { PluginRegistry } from "./core/plugin"
export type { Plugin } from "./core/plugin"
export { createTool, Tool, toolFactory } from "./core/tool"
export type { ToolConfig } from "./core/tool"
export { generateXMTPToolsToken } from "./lib/jwt"
export { listen } from "./server/listen"
export type { ListenOptions } from "./server/listen"
export { getBgState, stopBackground } from "./server/processor"
export * from "./types"

// Re-export XMTP types and utilities
import type { MessageListenerConfig, Reaction } from "@hybrd/xmtp"

export type { MessageListenerConfig, Reaction }
