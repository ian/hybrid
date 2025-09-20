import type {
	AgentRuntime,
	XmtpClient,
	XmtpConversation,
	XmtpMessage
} from "./index"

/**
 * Configuration options for a behavior
 */
export interface BehaviorConfig {
	/** Whether the behavior is enabled */
	enabled?: boolean
	/** Optional configuration data for the behavior */
	config?: Record<string, unknown>
}

/**
 * Context provided to behaviors when they execute
 */
export interface BehaviorContext<TRuntimeExtension = Record<string, never>> {
	/** The base runtime context */
	runtime: AgentRuntime & TRuntimeExtension
	/** The XMTP client instance */
	client: XmtpClient
	/** The conversation the message came from */
	conversation: XmtpConversation
	/** The message that triggered the behavior */
	message: XmtpMessage
	/** The agent's response (available in post-response behaviors) */
	response?: string
}

/**
 * A behavior that can be executed before or after agent responses
 */
export interface Behavior<TRuntimeExtension = Record<string, never>> {
	/** Unique identifier for the behavior */
	id: string
	/** Human-readable name for the behavior */
	name: string
	/** Description of what the behavior does */
	description: string
	/** Configuration for the behavior */
	config: BehaviorConfig
	/** Whether this behavior should run before the agent responds */
	preResponse?: boolean
	/** Whether this behavior should run after the agent responds */
	postResponse?: boolean
	/**
	 * Execute the behavior with the given context
	 * @param context - The context in which to execute the behavior
	 */
	execute(context: BehaviorContext<TRuntimeExtension>): Promise<void> | void
}

/**
 * Factory function to create a behavior instance
 */
export type BehaviorFactory<TConfig = Record<string, unknown>> = (
	config: TConfig & BehaviorConfig
) => Behavior

/**
 * Pre-configured behavior instance that can be used directly
 */
export type BehaviorInstance = Behavior

/**
 * Behavior registry for managing and executing behaviors
 */
export interface BehaviorRegistry {
	/**
	 * Register a behavior with the registry
	 */
	register(behavior: Behavior): void

	/**
	 * Register multiple behaviors at once
	 */
	registerAll(behaviors: Behavior[]): void

	/**
	 * Get all registered behaviors
	 */
	getAll(): Behavior[]

	/**
	 * Get behaviors that should run before the agent responds
	 */
	getPreResponseBehaviors(): Behavior[]

	/**
	 * Get behaviors that should run after the agent responds
	 */
	getPostResponseBehaviors(): Behavior[]

	/**
	 * Execute all pre-response behaviors
	 */
	executePreResponse(context: BehaviorContext): Promise<void>

	/**
	 * Execute all post-response behaviors
	 */
	executePostResponse(context: BehaviorContext): Promise<void>

	/**
	 * Clear all registered behaviors
	 */
	clear(): void
}

/**
 * Concrete implementation of the BehaviorRegistry interface
 */
export class BehaviorRegistryImpl implements BehaviorRegistry {
	private behaviors: Behavior[] = []

	/**
	 * Register a behavior with the registry
	 */
	register(behavior: Behavior): void {
		this.behaviors.push(behavior)
	}

	/**
	 * Register multiple behaviors at once
	 */
	registerAll(behaviors: Behavior[]): void {
		this.behaviors.push(...behaviors)
	}

	/**
	 * Get all registered behaviors
	 */
	getAll(): Behavior[] {
		return [...this.behaviors]
	}

	/**
	 * Get behaviors that should run before the agent responds
	 */
	getPreResponseBehaviors(): Behavior[] {
		return this.behaviors.filter((behavior) => behavior.preResponse)
	}

	/**
	 * Get behaviors that should run after the agent responds
	 */
	getPostResponseBehaviors(): Behavior[] {
		return this.behaviors.filter((behavior) => behavior.postResponse)
	}

	/**
	 * Execute all pre-response behaviors
	 */
	async executePreResponse(context: BehaviorContext): Promise<void> {
		const behaviors = this.getPreResponseBehaviors()
		for (const behavior of behaviors) {
			try {
				await behavior.execute(context)
			} catch (error) {
				console.error(
					`Error executing pre-response behavior ${behavior.id}:`,
					error
				)
			}
		}
	}

	/**
	 * Execute all post-response behaviors
	 */
	async executePostResponse(context: BehaviorContext): Promise<void> {
		const behaviors = this.getPostResponseBehaviors()
		for (const behavior of behaviors) {
			try {
				await behavior.execute(context)
			} catch (error) {
				console.error(
					`Error executing post-response behavior ${behavior.id}:`,
					error
				)
			}
		}
	}

	/**
	 * Clear all registered behaviors
	 */
	clear(): void {
		this.behaviors = []
	}
}
