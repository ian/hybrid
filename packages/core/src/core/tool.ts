import { Tool as AISDKTool, type UIMessage } from "ai"
import { z } from "zod"
import { AgentRuntime } from "../types"

type AnyTool<TRuntimeExtension = DefaultRuntimeExtension> = Tool<any, any, TRuntimeExtension>

type DefaultRuntimeExtension = Record<string, never>

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

/**
 * Factory function to create tools with custom runtime extensions.
 * Provides proper type inference for input/output schemas and runtime extensions.
 */
export function toolFactory<TRuntimeExtension = DefaultRuntimeExtension>() {
	return <
		TInput extends z.ZodTypeAny = z.ZodTypeAny,
		TOutput extends z.ZodTypeAny = z.ZodTypeAny
	>(
		config: ToolConfig<TInput, TOutput, TRuntimeExtension>
	): Tool<TInput, TOutput, TRuntimeExtension> => {
		return {
			description: config.description,
			inputSchema: config.inputSchema,
			outputSchema: config.outputSchema,
			execute: async (args) => {
				const input = config.inputSchema.parse(args.input)
				const result = await config.execute({
					input,
					runtime: args.runtime,
					messages: args.messages
				})
				if (config.outputSchema) {
					return config.outputSchema.parse(result)
				}
				return result
			}
		}
	}
}

/**
 * Default tool factory with no runtime extensions.
 * Type-safe at creation time with proper schema inference.
 */
export const createTool = toolFactory()

/**
 * Converts a custom Tool instance to AI SDK's tool format.
 * This adapter enables our tools to work with AI SDK's generateText/streamText functions.
 */
export function toAISDKTool<
	TInput extends z.ZodTypeAny = z.ZodTypeAny,
	TOutput extends z.ZodTypeAny = z.ZodTypeAny,
	TRuntimeExtension = DefaultRuntimeExtension
>(
	tool: Tool<TInput, TOutput, TRuntimeExtension>,
	runtime: AgentRuntime & TRuntimeExtension,
	messages: UIMessage[]
): AISDKTool {
	return {
		description: tool.description,
		inputSchema: tool.inputSchema,
		execute: async (args: z.infer<typeof tool.inputSchema>) => {
			return tool.execute({
				input: args,
				runtime,
				messages
			})
		}
	}
}

/**
 * Converts a collection of custom tools to AI SDK format.
 * Useful for batch conversion when setting up multiple tools for AI SDK usage.
 */
export function toAISDKTools<TRuntimeExtension = DefaultRuntimeExtension>(
	tools: Record<string, AnyTool<TRuntimeExtension>>,
	runtime: AgentRuntime & TRuntimeExtension,
	messages: UIMessage[]
): Record<string, AISDKTool> {
	const convertedTools: Record<string, AISDKTool> = {}

	for (const [name, tool] of Object.entries(tools)) {
		convertedTools[name] = toAISDKTool(tool, runtime, messages)
	}

	return convertedTools
}
