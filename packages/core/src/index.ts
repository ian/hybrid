export type { AgentRuntime } from "@hybrd/types"
export { Agent } from "./core/agent"
export type { AgentConfig, DefaultRuntimeExtension } from "./core/agent"
export { PluginRegistry } from "./core/plugin"
export type { Plugin } from "./core/plugin"
export { createTool, toolFactory } from "./core/tool"
export type { Tool, ToolConfig } from "./core/tool"
export { listen } from "./server/listen"
export type { ListenOptions } from "./server/listen"

// Re-export XMTP Agent SDK filters for convenience
export { filter } from "@hybrd/xmtp"

// Re-export behaviors
export * from "./behaviors"

// Re-export tools standard library
export * from "./tools"
