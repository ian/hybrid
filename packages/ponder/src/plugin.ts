import { Hono } from "hono"
import { app as ponderApp } from "./endpoints"

export interface Plugin<TContext = unknown> {
	name: string
	description?: string
	apply: (app: Hono, context?: TContext) => void | Promise<void>
}

export interface PluginContext {
	agent: unknown
}

/**
 * Ponder Plugin that provides blockchain event handling functionality
 *
 * @description
 * This plugin integrates Ponder blockchain event handling into the agent's
 * HTTP server. It mounts the Ponder endpoints for receiving and processing
 * blockchain events.
 */
export function PonderPlugin(): Plugin<PluginContext> {
	return {
		name: "ponder",
		description: "Provides blockchain event handling via Ponder",
		apply: (app, context) => {
			// Mount the Ponder app at the root
			app.route("/", ponderApp)
		}
	}
}
