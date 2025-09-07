#!/usr/bin/env node

import { runBuild } from "./cmd/build.js"
import { runClean } from "./cmd/clean.js"
import { runDev } from "./cmd/dev.js"
import { generateKeys } from "./cmd/gen-keys.js"
// Import command modules
import { initializeProject } from "./cmd/init.js"
import { registerWallet } from "./cmd/register.js"
import { revokeAllInstallations } from "./cmd/revoke-all.js"
import { revokeInstallations } from "./cmd/revoke.js"

// Check Node.js version
const nodeVersion = process.versions.node
const [major] = nodeVersion.split(".").map(Number)
if (!major || major < 20) {
	console.error("Error: Node.js version 20 or higher is required")
	process.exit(1)
}

// Main CLI logic
async function main() {
	const command = process.argv[2]

	switch (command) {
		case "init":
			try {
				await initializeProject()
			} catch (error) {
				console.error("Failed to initialize project:", error)
				console.error(
					"Error details:",
					error instanceof Error ? error.stack : String(error)
				)
				process.exit(1)
			}
			break
		case "dev":
			runDev()
			break
		case "gen:keys":
			try {
				const writeFlag = process.argv.includes("--write")
				await generateKeys(writeFlag)
			} catch (error) {
				console.error("Failed to generate keys:", error)
				process.exit(1)
			}
			break
		case "register":
			try {
				await registerWallet()
			} catch (error) {
				console.error("Failed to register:", error)
				process.exit(1)
			}
			break
		case "revoke":
			try {
				const inboxId = process.argv[3]
				if (!inboxId) {
					console.error("❌ InboxID is required")
					console.error("Usage: hybrid revoke <inboxId>")
					process.exit(1)
				}
				await revokeInstallations(inboxId)
			} catch (error) {
				console.error("Failed to revoke:", error)
				process.exit(1)
			}
			break
		case "revoke:all":
			try {
				await revokeAllInstallations()
			} catch (error) {
				console.error("Failed to revoke all:", error)
				process.exit(1)
			}
			break
		case "build":
			runBuild()
			break
		case "clean":
			try {
				await runClean()
			} catch (error) {
				console.error("Failed to clean project:", error)
				process.exit(1)
			}
			break
		case "--help":
		case "-h":
		case "help":
		default:
			console.log("Usage: hybrid <command> or hy <command>")
			console.log("")
			console.log("Commands:")
			console.log("  init [name]  Create a new Hybrid project")
			console.log("  dev          Start development server with watch mode")
			console.log("  build        Build the TypeScript project")
			console.log("  clean        Remove dist and node_modules directories")
			console.log("  gen:keys     Generate XMTP wallet and encryption keys")
			console.log(
				"               Use --write to save keys directly to .env file"
			)
			console.log("  register     Register wallet with XMTP production network")
			console.log("  revoke       Revoke XMTP installations for specific inbox")
			console.log("               Usage: hybrid revoke <inboxId>")
			console.log(
				"  revoke:all   Revoke ALL XMTP installations for current wallet"
			)
			console.log("")
			console.log("Examples:")
			console.log("  hybrid init my-agent    or    hy init my-agent")
			console.log(
				"  hybrid init             or    hy init (will prompt for name)"
			)
			console.log("  hybrid dev              or    hy dev")
			console.log("  hybrid build            or    hy build")
			console.log("  hybrid clean            or    hy clean")
			console.log("  hybrid gen:keys         or    hy gen:keys")
			console.log("  hybrid gen:keys --write or    hy gen:keys --write")
			console.log("  hybrid register         or    hy register")
			console.log("  hybrid revoke <inboxId> or    hy revoke <inboxId>")
			console.log("  hybrid revoke:all       or    hy revoke:all")
			console.log("")
			// Exit with error code for unknown commands
			if (command && !["--help", "-h", "help"].includes(command)) {
				process.exit(1)
			}
	}
}

// Run the CLI
main().catch((error) => {
	console.error("CLI error:", error)
	console.error(
		"Error details:",
		error instanceof Error ? error.stack : String(error)
	)
	process.exit(1)
})
