import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		setupFiles: [],
		timeout: 30000,
		retry: 1,
		reporters: ["verbose"],
		coverage: {
			reporter: ["text", "json", "html"],
			exclude: ["node_modules", "dist", "tests"]
		}
	},
	resolve: {
		alias: {
			"@": "./src"
		}
	}
})
