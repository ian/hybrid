#!/usr/bin/env node

import { spawn } from "node:child_process"
import { getRandomValues } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { toString as uint8ToString } from "uint8arrays"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"

// Check Node.js version
const nodeVersion = process.versions.node
const [major] = nodeVersion.split(".").map(Number)
if (!major || major < 20) {
	console.error("Error: Node.js version 20 or higher is required")
	process.exit(1)
}

// Generate a random encryption key
function generateEncryptionKeyHex() {
	const uint8Array = getRandomValues(new Uint8Array(32))
	return uint8ToString(uint8Array, "hex")
}

// Generate keys and create .env file
async function generateKeys() {
	console.log("Generating XMTP keys...")

	const walletKey = generatePrivateKey()
	const account = privateKeyToAccount(walletKey)
	const encryptionKeyHex = generateEncryptionKeyHex()
	const publicKey = account.address

	const currentDir = process.cwd()
	const envPath = join(currentDir, ".env")

	console.log(`Creating .env file in: ${currentDir}`)

	// Read existing .env file if it exists
	let existingEnv = ""
	try {
		existingEnv = await readFile(envPath, "utf-8")
		console.log("Found existing .env file")
	} catch {
		console.log("No existing .env file found, creating new one")
	}

	// Check if XMTP_ENV is already set
	const xmtpEnvExists = existingEnv.includes("XMTP_ENV=")

	const envContent = `# XMTP keys for agent
WALLET_KEY=${walletKey}
ENCRYPTION_KEY=${encryptionKeyHex}
${!xmtpEnvExists ? "XMTP_ENV=dev\n" : ""}# public key is ${publicKey}
`

	// Write the .env file
	await writeFile(envPath, envContent, { flag: "a" })
	console.log(`Keys written to ${envPath}`)
	console.log(`Public key: ${publicKey}`)
}

// Run development server
function runDev() {
	console.log("Starting development server...")
	const child = spawn("tsx", ["--watch", "src/index.ts"], {
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

// Build the project
function runBuild() {
	console.log("Building project...")
	const child = spawn("tsc", [], {
		stdio: "inherit",
		shell: true
	})

	child.on("error", (error) => {
		console.error("Failed to build project:", error)
		process.exit(1)
	})

	child.on("exit", (code) => {
		if (code === 0) {
			console.log("Build completed successfully")
		} else {
			console.error("Build failed")
			process.exit(code ?? 1)
		}
	})
}

// Main CLI logic
function main() {
	const command = process.argv[2]

	switch (command) {
		case "dev":
			runDev()
			break
		case "gen:keys":
			generateKeys().catch((error) => {
				console.error("Failed to generate keys:", error)
				process.exit(1)
			})
			break
		case "build":
			runBuild()
			break
		default:
			console.log("Usage: hybrid <command> or hy <command>")
			console.log("")
			console.log("Commands:")
			console.log("  dev       Start development server with watch mode")
			console.log("  gen:keys  Generate XMTP wallet and encryption keys")
			console.log("  build     Build the TypeScript project")
			console.log("")
			console.log("Examples:")
			console.log("  hybrid dev")
			console.log("  hybrid gen:keys")
			console.log("  hybrid build")
			process.exit(1)
	}
}

// Run the CLI
main()
