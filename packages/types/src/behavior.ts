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
	pre?(context: BehaviorContext<TRuntimeExtension>): Promise<void> | void
	/**
	 * Execute the behavior after the agent responds
	 * @param context - The context in which to execute the behavior
	 */
	post?(context: BehaviorContext<TRuntimeExtension>): Promise<void> | void
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
	registerAll(behaviors: Behavior[]): void

	/**
	 * Get all registered behaviors
	 */
	getAll(): BehaviorObject[]

	/**
	 * Get behaviors that should run before the agent responds
	 */
	getPreBehaviors(): BehaviorObject[]

	/**
	 * Get behaviors that should run after the agent responds
	 */
	getPostBehaviors(): BehaviorObject[]

	/**
	 * Execute all pre-response behaviors
	 */
	executePre(context: BehaviorContext): Promise<void>

	/**
	 * Execute all post-response behaviors
	 */
	executePost(context: BehaviorContext): Promise<void>

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
	registerAll(behaviors: Behavior[]): void {
		// Create behavior instances from factory functions with default config
		const behaviorInstances = behaviors.map((behavior) => behavior({}))
		this.behaviors.push(...behaviorInstances)
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
	getPreBehaviors(): BehaviorObject[] {
		return this.behaviors.filter((behavior) => behavior.pre)
	}

	/**
	 * Get behaviors that should run after the agent responds
	 */
	getPostBehaviors(): BehaviorObject[] {
		return this.behaviors.filter((behavior) => behavior.post)
	}

	/**
	 * Execute all pre-response behaviors
	 */
	async executePre(context: BehaviorContext): Promise<void> {
		const behaviors = this.getPreBehaviors()
		for (const behavior of behaviors) {
			try {
				await behavior.pre?.(context)
			} catch (error) {
				console.error(`Error executing pre behavior "${behavior.id}":`, error)
			}
		}
	}

	/**
	 * Execute all post-response behaviors
	 */
	async executePost(context: BehaviorContext): Promise<void> {
		const behaviors = this.getPostBehaviors()
		for (const behavior of behaviors) {
			try {
				await behavior.post?.(context)
			} catch (error) {
				console.error(`Error executing post behavior "${behavior.id}":`, error)
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
