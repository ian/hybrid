import dotenv from "dotenv"
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"

// Run development server
export function runDev() {
	console.log("Starting development server...")

	// Load environment variables from .env file
	const envPath = join(process.cwd(), ".env")
	if (existsSync(envPath)) {
		dotenv.config({ path: envPath })
		console.log("✅ Loaded environment variables from .env")
	} else {
		console.log("⚠️  No .env file found - environment variables not loaded")
	}

	const child = spawn("tsx", ["--watch", "src/agent.ts"], {
		stdio: "inherit",
		shell: true
	})

	child.on("error", (error) => {
		console.error("Failed to start dev server:", error)
		process.exit(1)
	})

	child.on("exit", (code) => {
		process.exit(code ?? 0)
	})
}
