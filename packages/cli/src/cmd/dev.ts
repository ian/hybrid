import dotenv from "dotenv"
import { type ChildProcess, spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"

let currentChild: ChildProcess | null = null

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

	// Function to start the tsx process
	function startTsxProcess() {
		if (currentChild) {
			console.log("Stopping existing process...")
			currentChild.kill("SIGTERM")
		}

		currentChild = spawn("tsx", ["--watch", "src/agent.ts"], {
			stdio: "inherit",
			shell: true,
			env: {
				...process.env,
				// Force tsx to exit cleanly on file changes
				TSX_WATCH_IGNORE_PATHS: "node_modules/**",
				// Enable source map support for better stack traces
				NODE_OPTIONS:
					`${process.env.NODE_OPTIONS || ""} --enable-source-maps`.trim()
			}
		})

		currentChild.on("error", (error) => {
			console.error("Failed to start dev server:", error)
			process.exit(1)
		})

		currentChild.on("exit", (code, signal) => {
			if (signal === "SIGTERM" || signal === "SIGINT") {
				console.log("Process terminated cleanly")
			} else if (code !== 0) {
				console.error(`Process exited with code ${code}`)
			}
		})
	}

	// Handle graceful shutdown
	function gracefulShutdown(signal: string) {
		console.log(`\nReceived ${signal}. Shutting down gracefully...`)

		if (currentChild) {
			console.log("Stopping tsx process...")
			currentChild.kill("SIGTERM")

			// Force kill after timeout
			const forceKillTimeout = setTimeout(() => {
				console.log("Force killing tsx process...")
				if (currentChild) {
					currentChild.kill("SIGKILL")
				}
				process.exit(1)
			}, 5000)

			currentChild.on("exit", () => {
				clearTimeout(forceKillTimeout)
				process.exit(0)
			})
		} else {
			process.exit(0)
		}
	}

	// Set up signal handlers
	process.on("SIGINT", () => gracefulShutdown("SIGINT"))
	process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))

	// Start the initial process
	startTsxProcess()
}
