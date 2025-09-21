import type { BehaviorContext, BehaviorObject, XMTPFilter } from "@hybrd/types"

export function filterMessages(filters: XMTPFilter[]): BehaviorObject {
	return {
		id: "filter-messages",
		config: {
			enabled: true,
			config: {
				filters: filters.length
			}
		},
		async pre(context: BehaviorContext) {
			if (filters.length === 0) return

			for (const filter of filters) {
				try {
					const passes = await filter(
						context.message,
						context.client,
						context.conversation
					)
					if (!passes) {
						if (!context.sendOptions) {
							context.sendOptions = {}
						}
						context.sendOptions.filtered = true
						break
					}
				} catch (error) {
					console.error("Error executing message filter:", error)
				}
			}
		}
	}
}
