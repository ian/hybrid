import type { UIMessage } from "ai"
import type { z } from "zod"
import type { DefaultRuntimeExtension } from "./agent"
import type { AgentRuntime } from "./runtime"

/**
 * Configuration interface for creating custom tools that integrate with AI SDK.
 */
export interface ToolConfig<
	TInput extends z.ZodTypeAny = z.ZodTypeAny,
	TOutput extends z.ZodTypeAny = z.ZodTypeAny,
	TRuntimeExtension = DefaultRuntimeExtension
> {
	/** Unique identifier for the tool */
	id: string
	/** Human-readable description of what the tool does */
	description: string
	/** Zod schema for validating tool input */
	inputSchema: TInput
	/** Optional Zod schema for validating tool output */
	outputSchema?: TOutput
	/** Function that executes the tool's logic */
	execute: (args: {
		input: z.infer<TInput>
		runtime: AgentRuntime & TRuntimeExtension
		messages: UIMessage[]
	}) => Promise<z.infer<TOutput>>
}

/**
 * Internal tool interface used throughout the agent framework.
 * Similar to ToolConfig but without the ID field, used after tool creation.
 */
export interface Tool<
	TInput extends z.ZodTypeAny = z.ZodTypeAny,
	TOutput extends z.ZodTypeAny = z.ZodTypeAny,
	TRuntimeExtension = DefaultRuntimeExtension
> {
	/** Human-readable description of what the tool does */
	description: string
	/** Zod schema for validating tool input */
	inputSchema: TInput
	/** Optional Zod schema for validating tool output */
	outputSchema?: TOutput
	/** Function that executes the tool's logic */
	execute: (args: {
		input: z.infer<TInput>
		runtime: AgentRuntime & TRuntimeExtension
		messages: UIMessage[]
	}) => Promise<z.infer<TOutput>>
}

export type AnyTool<TRuntimeExtension = DefaultRuntimeExtension> = Tool<
	any,
	any,
	TRuntimeExtension
>
