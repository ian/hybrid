import type { Plugin } from "../core/plugin"
import type { PluginContext } from "../server/listen"
import { app as ponderApp } from "./endpoints"

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
