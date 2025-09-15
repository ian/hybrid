import type {
	LanguageModel,
	TelemetrySettings,
	UIMessage,
	UIMessageStreamOnFinishCallback,
	generateText,
	streamText
} from "ai"
import type { AgentRuntime } from "./runtime"
import type { AnyTool } from "./tool"

export type DefaultRuntimeExtension = Record<string, never>

export type ToolGenerator<TRuntimeExtension = DefaultRuntimeExtension> =
	(props: {
		runtime: AgentRuntime & TRuntimeExtension
		messages: UIMessage[]
	}) =>
		| Record<string, AnyTool<TRuntimeExtension>>
		| Promise<Record<string, AnyTool<TRuntimeExtension>>>

/**
 * Configuration interface for creating an Agent instance.
 * Supports both static and dynamic configuration through functions.
 */
export interface AgentConfig<TRuntimeExtension = DefaultRuntimeExtension> {
	/** Unique identifier for the agent */
	name: string
	/** Language model to use, can be static or dynamically resolved */
	model:
		| LanguageModel
		| ((props: {
				runtime: AgentRuntime & TRuntimeExtension
		  }) => LanguageModel | Promise<LanguageModel>)
	/** Tools available to the agent, can be static or dynamically generated */
	tools?:
		| Record<string, AnyTool<TRuntimeExtension>>
		| ToolGenerator<TRuntimeExtension>
	/** Instructions for the agent, can be static or dynamically resolved */
	instructions:
		| string
		| ((props: {
				messages: UIMessage[]
				runtime: AgentRuntime & TRuntimeExtension
		  }) => string | Promise<string>)
	/** Function to create the runtime extension, type will be inferred */
	createRuntime?: (
		runtime: AgentRuntime
	) => TRuntimeExtension | Promise<TRuntimeExtension>
	/** Optional metadata for the agent */
	metadata?: Record<string, unknown>
	/** Maximum number of steps the agent can take */
	maxSteps?: number
	/** Maximum tokens for generation */
	maxTokens?: number
	/** Temperature for generation (0.0 to 2.0) */
	temperature?: number
}

/**
 * Options for text generation with the agent.
 * Extends AI SDK parameters while adding agent-specific options.
 */
export interface GenerateOptions<TRuntimeExtension = DefaultRuntimeExtension>
	extends Omit<
		Parameters<typeof generateText>[0],
		"model" | "tools" | "instructions" | "onFinish"
	> {
	/** Maximum tokens for generation */
	maxTokens?: number
	/** Runtime context for the agent */
	runtime: AgentRuntime & TRuntimeExtension
	/** Optional telemetry configuration */
	telemetry?: NonNullable<TelemetrySettings>
}

export interface StreamOptions<TRuntimeExtension = DefaultRuntimeExtension>
	extends Omit<
		Parameters<typeof streamText>[0],
		"model" | "tools" | "instructions" | "onFinish"
	> {
	/** Maximum tokens for generation */
	maxTokens?: number
	/** Runtime context for the agent */
	runtime: AgentRuntime & TRuntimeExtension
	/** Optional telemetry configuration */
	telemetry?: NonNullable<TelemetrySettings>
	/** Callback when streaming finishes */
	onFinish?: UIMessageStreamOnFinishCallback<UIMessage>
}
