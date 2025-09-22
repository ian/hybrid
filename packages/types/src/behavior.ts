import type { AgentRuntime } from "./runtime"
import type { XmtpClient, XmtpConversation, XmtpMessage } from "./xmtp"

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
	/** Send options that behaviors can modify */
	sendOptions?: {
		/** Whether to thread the reply to the original message */
		threaded?: boolean
		/** Content type override */
		contentType?: string
		/** Whether this message should be filtered out and not processed */
		filtered?: boolean
		/** Additional metadata */
		metadata?: Record<string, unknown>
	}
	/**
	 * Continue to the next behavior in the middleware chain
	 * If not called, the behavior chain stops processing
	 */
	next?: () => Promise<void>
	/**
	 * Whether the middleware chain was stopped early
	 * This gets set to true when a behavior doesn't call next()
	 */
	stopped?: boolean
}

/**
 * A behavior that can be executed before or after agent responses
 */
export interface BehaviorObject<TRuntimeExtension = Record<string, never>> {
	/** Unique identifier for the behavior */
	id: string
	/** Configuration for the behavior */
	config: BehaviorConfig
	/**
	 * Execute the behavior before the agent responds
	 * @param context - The context in which to execute the behavior
	 */
	before?(context: BehaviorContext<TRuntimeExtension>): Promise<void> | void
	/**
	 * Execute the behavior after the agent responds
	 * @param context - The context in which to execute the behavior
	 */
	after?(context: BehaviorContext<TRuntimeExtension>): Promise<void> | void
}

/**
 * Factory function to create a behavior instance
 */
export type Behavior<TConfig = Record<string, unknown>> = (
	config: TConfig & BehaviorConfig
) => BehaviorObject

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
	register(behavior: BehaviorObject): void

	/**
	 * Register multiple behaviors at once
	 */
	registerAll(behaviors: BehaviorObject[]): void

	/**
	 * Get all registered behaviors
	 */
	getAll(): BehaviorObject[]

	/**
	 * Get behaviors that should run before the agent responds
	 */
	getBeforeBehaviors(): BehaviorObject[]

	/**
	 * Get behaviors that should run after the agent responds
	 */
	getAfterBehaviors(): BehaviorObject[]

	/**
	 * Execute all before-response behaviors as a middleware chain
	 */
	executeBefore(context: BehaviorContext): Promise<void>

	/**
	 * Execute all after-response behaviors as a middleware chain
	 */
	executeAfter(context: BehaviorContext): Promise<void>

	/**
	 * Clear all registered behaviors
	 */
	clear(): void
}

/**
 * Concrete implementation of the BehaviorRegistry interface
 */
export class BehaviorRegistryImpl implements BehaviorRegistry {
	private behaviors: BehaviorObject[] = []

	/**
	 * Register a behavior with the registry
	 */
	register(behavior: BehaviorObject): void {
		this.behaviors.push(behavior)
	}

	/**
	 * Register multiple behaviors at once
	 */
	registerAll(behaviors: BehaviorObject[]): void {
		// Register behavior objects directly
		this.behaviors.push(...behaviors)
	}

	/**
	 * Get all registered behaviors
	 */
	getAll(): BehaviorObject[] {
		return [...this.behaviors]
	}

	/**
	 * Get behaviors that should run before the agent responds
	 */
	getBeforeBehaviors(): BehaviorObject[] {
		return this.behaviors.filter((behavior) => behavior.before)
	}

	/**
	 * Get behaviors that should run after the agent responds
	 */
	getAfterBehaviors(): BehaviorObject[] {
		return this.behaviors.filter((behavior) => behavior.after)
	}

	/**
	 * Execute all before-response behaviors as a middleware chain
	 */
	async executeBefore(context: BehaviorContext): Promise<void> {
		const behaviors = this.getBeforeBehaviors()

		// Create a middleware chain
		let currentIndex = 0
		const next = async (): Promise<void> => {
			if (currentIndex >= behaviors.length) {
				return
			}

			const behavior = behaviors[currentIndex]
			if (!behavior) {
				return
			}
			currentIndex++

			try {
				await behavior.before?.(context)
			} catch (error) {
				console.error(
					`Error executing before behavior "${behavior.id}":`,
					error
				)
			}
		}

		// Set the next function in the context
		context.next = next

		// Start the chain
		await next()

		// Check if the chain was stopped early
		context.stopped = currentIndex < behaviors.length
	}

	/**
	 * Execute all after-response behaviors as a middleware chain
	 */
	async executeAfter(context: BehaviorContext): Promise<void> {
		const behaviors = this.getAfterBehaviors()

		// Create a middleware chain
		let currentIndex = 0
		const next = async (): Promise<void> => {
			if (currentIndex >= behaviors.length) {
				return
			}

			const behavior = behaviors[currentIndex]
			if (!behavior) {
				return
			}
			currentIndex++

			try {
				await behavior.after?.(context)
			} catch (error) {
				console.error(`Error executing after behavior "${behavior.id}":`, error)
			}
		}

		// Set the next function in the context
		context.next = next

		// Start the chain
		await next()

		// Check if the chain was stopped early
		context.stopped = currentIndex < behaviors.length
	}

	/**
	 * Clear all registered behaviors
	 */
	clear(): void {
		this.behaviors = []
	}
}
