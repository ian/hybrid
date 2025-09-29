import type { UIMessage } from "ai"
import type { z } from "zod"
import type { DefaultRuntimeExtension } from "./agent"
import type { AgentRuntime } from "./runtime"

/**
 * Internal tool interface used throughout the agent framework.
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
