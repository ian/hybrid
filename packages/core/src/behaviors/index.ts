// Re-export XMTP Agent SDK filters for convenience
export { filter } from "@hybrd/xmtp"

export * from "./filter-messages"
export * from "./react-with"
export * from "./threaded-reply"

// Re-export behavior types for convenience
export { BehaviorRegistryImpl } from "@hybrd/types"
export type {
	Behavior,
	BehaviorConfig,
	BehaviorContext,
	BehaviorObject,
	BehaviorRegistry
} from "@hybrd/types"
