import type {
	AgentRuntime,
	AnyTool,
	DefaultRuntimeExtension,
	Tool,
	ToolConfig
} from "@hybrd/types"
import { Tool as AISDKTool, type UIMessage } from "ai"
import { z } from "zod"

// Re-export types from @hybrd/types for backward compatibility
export type { AnyTool, DefaultRuntimeExtension, Tool, ToolConfig }

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
