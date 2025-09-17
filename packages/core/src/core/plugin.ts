import type { HonoVariables, Plugin } from "@hybrd/types"
import type { Hono } from "hono"

// Re-export types from @hybrd/types for backward compatibility
export type { Plugin }

/**
 * Plugin registry that manages all registered plugins
 *
 * @description
 * The plugin registry allows you to register, configure, and apply
 * plugins to Hono apps. It provides a centralized way to manage
 * plugin dependencies and execution order.
 */
export class PluginRegistry<T = Record<string, never>> {
	private plugins: Map<string, Plugin<T>> = new Map()

	/**
	 * Registers a plugin with the registry
	 *
	 * @param plugin - The plugin to register
	 * @throws {Error} If a plugin with the same name is already registered
	 */
	register(plugin: Plugin<T>): void {
		if (this.plugins.has(plugin.name)) {
			throw new Error(`Plugin "${plugin.name}" is already registered`)
		}

		this.plugins.set(plugin.name, plugin)
	}

	/**
	 * Unregisters a plugin from the registry
	 *
	 * @param name - The name of the plugin to unregister
	 * @returns True if the plugin was unregistered, false if it wasn't found
	 */
	unregister(name: string): boolean {
		return this.plugins.delete(name)
	}

	/**
	 * Gets a plugin by name
	 *
	 * @param name - The name of the plugin to retrieve
	 * @returns The plugin if found, undefined otherwise
	 */
	get(name: string): Plugin<T> | undefined {
		return this.plugins.get(name)
	}

	/**
	 * Gets all registered plugins
	 *
	 * @returns Array of all registered plugins
	 */
	getAll(): Plugin<T>[] {
		return Array.from(this.plugins.values())
	}

	/**
	 * Checks if a plugin is registered
	 *
	 * @param name - The name of the plugin to check
	 * @returns True if the plugin is registered, false otherwise
	 */
	has(name: string): boolean {
		return this.plugins.has(name)
	}

	/**
	 * Applies all registered plugins to a Hono app
	 *
	 * @param app - The Hono app instance to extend
	 * @param context - Optional context data passed to all plugins
	 */
	async applyAll(
		app: Hono<{ Variables: HonoVariables }>,
		context: T
	): Promise<void> {
		const plugins = this.getAll()

		for (const plugin of plugins) {
			try {
				console.log(`🔌 Applying plugin: ${plugin.name}`)
				await plugin.apply(app, context)
				console.log(`✅ Plugin applied: ${plugin.name}`)
			} catch (error) {
				console.error(`❌ Failed to apply plugin ${plugin.name}:`, error)
				throw error
			}
		}
	}

	/**
	 * Clears all registered plugins
	 */
	clear(): void {
		this.plugins.clear()
	}

	/**
	 * Gets the number of registered plugins
	 */
	get size(): number {
		return this.plugins.size
	}
}

/**
 * Creates a plugin that mounts routes at a specific path
 *
 * @param name - Plugin name
 * @param path - Path to mount the routes at
 * @param routes - Hono app containing the routes to mount
 * @returns A plugin that mounts the routes
 */
export function createRoutePlugin(
	name: string,
	path: string,
	routes: Hono<{ Variables: HonoVariables }>
): Plugin {
	return {
		name,
		description: `Mounts routes at ${path}`,
		apply: (app: Hono<{ Variables: HonoVariables }>) => {
			app.route(path, routes)
		}
	}
}

/**
 * Creates a plugin that applies middleware
 *
 * @param name - Plugin name
 * @param middleware - Middleware function to apply
 * @returns A plugin that applies the middleware
 */
export function createMiddlewarePlugin(
	name: string,
	middleware: (app: Hono<{ Variables: HonoVariables }>) => void
): Plugin {
	return {
		name,
		description: `Applies middleware: ${name}`,
		apply: middleware
	}
}
