#!/usr/bin/env node

import {
	Client,
	createSigner,
	createXMTPClient,
	logAgentDetails,
	validateEnvironment
} from "@hybrd/xmtp"
import degit from "degit"
import dotenv from "dotenv"
import { spawn } from "node:child_process"
import { getRandomValues } from "node:crypto"
import { existsSync } from "node:fs"
import { readFile, readdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { createInterface } from "node:readline"
import { fileURLToPath } from "node:url"
import { toString as uint8ToString } from "uint8arrays"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"

const __dirname = dirname(fileURLToPath(import.meta.url))

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

// Generate keys and display them for manual addition to .env
async function generateKeys(writeToFile = false) {
	console.log("🔑 Generating XMTP keys...")

	const walletKey = generatePrivateKey()
	const account = privateKeyToAccount(walletKey)
	const encryptionKeyHex = generateEncryptionKeyHex()
	const publicKey = account.address

	console.log("\n✅ Keys generated successfully!")

	if (writeToFile) {
		try {
			const envContent = `# XMTP Configuration
XMTP_WALLET_KEY=${walletKey}
XMTP_ENCRYPTION_KEY=${encryptionKeyHex}
XMTP_ENV=dev

# OpenRouter Configuration
# Get your OpenRouter API key from https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Server Configuration (optional)
# PORT=8454
`
			await writeFile(".env", envContent)
			console.log("\n📁 Environment variables written to .env file")
			console.log(`🔍 Your public key (wallet address): ${publicKey}`)
			console.log("\n📝 Next steps:")
			console.log("1. Add your OPENROUTER_API_KEY to the .env file")
			console.log(
				"2. Set XMTP_ENV to 'dev' for development or 'production' for mainnet"
			)
		} catch (error) {
			console.error("❌ Failed to write .env file:", error)
			console.log("\n📋 Use these environment variables instead:")
			console.log("=".repeat(60))
			console.log(`XMTP_WALLET_KEY=${walletKey}`)
			console.log(`XMTP_ENCRYPTION_KEY=${encryptionKeyHex}`)
			console.log(`XMTP_ENV=dev`)
			console.log("=".repeat(60))
		}
	} else {
		console.log(`XMTP_WALLET_KEY=${walletKey}`)
		console.log(`XMTP_ENCRYPTION_KEY=${encryptionKeyHex}`)
		console.log(`XMTP_ENV=dev`)
		console.log(`\n# Your public key (wallet address): ${publicKey}`)
	}

	console.log(
		"\n⚠️  Keep these keys secure and never commit them to version control!"
	)
}

// Register wallet with XMTP network
async function registerWallet() {
	console.log("🚀 Starting XMTP Production Network Registration...")

	// Validate required environment variables
	const { XMTP_WALLET_KEY } = validateEnvironment([
		"XMTP_WALLET_KEY",
		"XMTP_ENCRYPTION_KEY"
	])

	if (!XMTP_WALLET_KEY) {
		console.error("❌ XMTP_WALLET_KEY is required for registration")
		console.log("💡 Run 'hybrid gen:keys --write' to generate keys first")
		process.exit(1)
	}

	try {
		console.log("🔑 Creating signer...")
		const signer = createSigner(XMTP_WALLET_KEY)

		// Get wallet address for logging
		const identifier = await signer.getIdentifier()
		const address = identifier.identifier
		console.log(`📍 Wallet Address: ${address}`)

		console.log("🌐 Connecting to XMTP Production Network...")
		console.log("⚠️  This will prompt you to sign messages in your wallet")
		console.log("   - 'XMTP : Authenticate to inbox' message")
		console.log("   - 'Grant messaging access to app' message")
		console.log("   - 'Create inbox' message (if first time)")

		// Connect to production network
		const client = await createXMTPClient(XMTP_WALLET_KEY)

		console.log("✅ Successfully connected to XMTP Production Network!")

		// Log client details
		await logAgentDetails(client)

		console.log("📡 Syncing conversations...")
		await client.conversations.sync()

		const conversations = await client.conversations.list()
		console.log(`💬 Found ${conversations.length} existing conversations`)

		console.log("🎉 Registration Complete!")
		console.log(`
✓ Wallet ${address} is now registered on XMTP Production Network
✓ Inbox ID: ${client.inboxId}
✓ Ready to receive messages on production network

Next steps:
1. Update your environment: XMTP_ENV=production
2. Start your listener service
3. Share your address for others to message: ${address}
4. Test messaging at: https://xmtp.chat/dm/${address}
		`)
	} catch (error) {
		console.error("❌ Registration failed:", error)

		if (error instanceof Error) {
			if (error.message.includes("User rejected")) {
				console.log(
					"📝 Registration was cancelled. You need to approve the wallet signatures to complete registration."
				)
			} else if (error.message.includes("network")) {
				console.log(
					"🌐 Network connection issue. Please check your internet connection and try again."
				)
			} else {
				console.log("💡 Make sure your wallet is connected and try again.")
			}
		}

		process.exit(1)
	}
}

// Revoke XMTP installations for specific inbox
async function revokeInstallations(inboxId: string) {
	console.log(`🔧 Revoking XMTP installations for inbox: ${inboxId}`)

	const { XMTP_WALLET_KEY } = process.env

	if (!XMTP_WALLET_KEY) {
		console.error("❌ XMTP_WALLET_KEY is required")
		console.log("💡 Run 'hybrid gen:keys --write' to generate keys first")
		process.exit(1)
	}

	try {
		const signer = createSigner(XMTP_WALLET_KEY)
		const identifier = await signer.getIdentifier()
		const address = identifier.identifier

		console.log(`🔑 Wallet Address: ${address}`)
		console.log(`📋 Inbox ID: ${inboxId}`)

		console.log("🔍 Getting inbox state...")
		const inboxStates = await Client.inboxStateFromInboxIds(
			[inboxId],
			(process.env.XMTP_ENV as "dev" | "production") || "dev"
		)

		if (!inboxStates[0]) {
			console.log("❌ No inbox state found for the provided inboxId")
			process.exit(1)
		}

		const toRevokeInstallationBytes = inboxStates[0].installations.map(
			(i) => i.bytes
		)

		if (toRevokeInstallationBytes.length === 0) {
			console.log("ℹ️ No installations found to revoke")
			return
		}

		console.log(
			`🔧 Revoking ${toRevokeInstallationBytes.length} installations...`
		)

		await Client.revokeInstallations(
			signer,
			inboxId,
			toRevokeInstallationBytes,
			(process.env.XMTP_ENV as "dev" | "production") || "dev"
		)

		const resultingStates = await Client.inboxStateFromInboxIds(
			[inboxId],
			(process.env.XMTP_ENV as "dev" | "production") || "dev"
		)

		console.log(
			`✅ Successfully revoked installations: ${toRevokeInstallationBytes.length} installations`
		)
		console.log(
			`📋 Resulting state: ${resultingStates[0]?.installations.length || 0} installations remaining`
		)
	} catch (error) {
		console.error("❌ Error during installation revocation:", error)

		if (error instanceof Error) {
			if (error.message.includes("Missing existing member")) {
				console.log(
					"\n💡 This inbox ID may not exist or may be on a different environment"
				)
				console.log(
					"   1. Check if you're using the correct XMTP_ENV (dev vs production)"
				)
				console.log("   2. Verify the inbox ID is correct")
			}
		}

		process.exit(1)
	}
}

// Revoke ALL XMTP installations for current wallet
async function revokeAllInstallations() {
	console.log("🔄 Revoking ALL XMTP Installations")
	console.log("==================================")

	const { XMTP_WALLET_KEY } = process.env

	if (!XMTP_WALLET_KEY) {
		console.error("❌ XMTP_WALLET_KEY is required")
		console.log("💡 Run 'hybrid gen:keys --write' to generate keys first")
		process.exit(1)
	}

	try {
		console.log(`🌐 Environment: ${process.env.XMTP_ENV || "dev"}`)

		// Try to create client to get current inbox ID
		try {
			const client = await createXMTPClient(XMTP_WALLET_KEY)
			const currentInboxId = client.inboxId

			console.log(`📧 Current Inbox ID: ${currentInboxId}`)
			console.log("🔧 Attempting to revoke all installations for this inbox...")

			// Use the local revoke function
			await revokeInstallations(currentInboxId)

			console.log("✅ Successfully revoked all installations")
		} catch (clientError) {
			console.log(
				"⚠️ Could not create client, attempting alternative approach..."
			)

			// If we can't create a client, it might be because of installation limits
			console.log("🔍 This might indicate installation limit issues")
			console.log("💡 You may need to:")
			console.log("   1. Wait a few minutes and try again")
			console.log("   2. Use the specific inbox ID if you know it")
			console.log("   3. Try switching XMTP environments (dev <-> production)")

			throw clientError
		}
	} catch (error) {
		console.error("💥 Error revoking installations:", error)

		if (error instanceof Error) {
			if (error.message.includes("5/5 installations")) {
				console.log("\n💡 Installation limit reached. Possible solutions:")
				console.log("   1. Wait 24 hours for installations to expire")
				console.log(
					"   2. Try switching XMTP environments (dev <-> production)"
				)
				console.log("   3. Use a different wallet")
			}
		}

		process.exit(1)
	}
}

// Prompt user for input
function prompt(question: string): Promise<string> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout
	})

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close()
			resolve(answer)
		})
	})
}

// Template variable substitution
function replaceTemplateVariables(
	content: string,
	variables: Record<string, string>
): string {
	return content.replace(
		/\{\{(\w+)\}\}/g,
		(match, key) => variables[key] || match
	)
}

// Initialize a new hybrid project
async function initializeProject() {
	console.log("🚀 Creating a new Hybrid project...")

	// Get project name
	const projectNameArg = process.argv[3] // Allow passing name as argument
	let projectName = projectNameArg

	if (!projectName) {
		while (!projectName || !projectName.trim()) {
			projectName = await prompt("Enter project name: ")
			if (!projectName || !projectName.trim()) {
				console.log("❌ Project name is required. Please enter a valid name.")
			}
		}
	}

	// Sanitize project name for package.json and directory
	const sanitizedName = projectName
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, "-") // Replace invalid chars with dashes
		.replace(/-+/g, "-") // Collapse multiple dashes
		.replace(/^-|-$/g, "") // Remove leading/trailing dashes

	// Create project directory
	const currentDir = process.cwd()
	const projectDir =
		projectName === "." ? currentDir : join(currentDir, sanitizedName)

	// Check if directory already exists and is not empty
	if (projectName !== ".") {
		try {
			const existingFiles = await readdir(projectDir)
			if (existingFiles.length > 0) {
				console.log(
					`❌ Directory "${sanitizedName}" already exists and is not empty`
				)
				console.log(
					"Please choose a different name or remove the existing directory"
				)
				process.exit(1)
			}
		} catch {
			// Directory doesn't exist, which is fine
		}
	}

	// Use degit to clone template from GitHub, with fallback to local templates
	console.log("📦 Downloading template from GitHub...")
	let templateDownloaded = false

	try {
		// Parse REPO environment variable to support repository and branch specification
		const repoEnv = process.env.REPO || "ian/hybrid"
		let templateRepo: string

		if (repoEnv.includes("#")) {
			// Format: user/repo#branch
			const [repo, branch] = repoEnv.split("#")
			templateRepo = `${repo}/templates/agent#${branch}`
			console.log(`🔗 Using repository: ${repo} (branch: ${branch})`)
		} else {
			// Format: user/repo (use default branch)
			templateRepo = `${repoEnv}/templates/agent`
			console.log(`🔗 Using repository: ${repoEnv} (default branch)`)
		}

		const emitter = degit(templateRepo, {
			cache: false,
			force: true,
			verbose: false
		})
		await emitter.clone(projectDir)
		console.log(`✅ Template downloaded from GitHub to: ${sanitizedName}`)
		templateDownloaded = true
	} catch (error) {
		console.error(
			"❌ Failed to download template from GitHub:",
			error instanceof Error ? error.message : String(error)
		)
		console.log(
			"💡 Make sure you have internet connection and the repository/branch exists"
		)
		process.exit(1)
	}

	if (!templateDownloaded) {
		console.error("❌ Could not download or copy template")
		process.exit(1)
	}

	// Replace template variables in all files
	const variables = {
		projectName: sanitizedName
	}

	try {
		// Read and update files with template variables
		const filesToUpdate = [
			join(projectDir, "package.json"),
			join(projectDir, "README.md")
		]

		for (const filePath of filesToUpdate) {
			try {
				let content = await readFile(filePath, "utf-8")
				content = replaceTemplateVariables(content, variables)
				await writeFile(filePath, content, "utf-8")
			} catch (error) {
				// File might not exist, continue
				console.log(
					`⚠️  Could not update ${filePath.split("/").pop()}: file not found`
				)
			}
		}

		console.log("✅ Template variables updated")
	} catch (error) {
		console.error("❌ Failed to update template variables:", error)
	}

	console.log("\n🎉 Hybrid project created successfully!")
	console.log(`\n📂 Project created in: ${projectDir}`)
	console.log("\n📋 Next steps:")
	console.log(`1. cd ${sanitizedName}`)
	console.log(
		"2. Install dependencies (npm install, yarn install, or pnpm install)"
	)
	console.log("3. Get your OpenRouter API key from https://openrouter.ai/keys")
	console.log("4. Add your API key to the OPENROUTER_API_KEY in .env")
	console.log("5. Set XMTP_ENV in .env (dev or production)")
	console.log("6. Generate keys: npm run keys (or yarn/pnpm equivalent)")
	console.log("7. Start development: npm run dev (or yarn/pnpm equivalent)")

	console.log(
		"\n📖 For more information, see the README.md file in your project"
	)
}

// Run development server
function runDev() {
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

// Run XMTP registration
async function runRegister() {
	// Load environment variables from .env file
	const envPath = join(process.cwd(), ".env")
	if (existsSync(envPath)) {
		dotenv.config({ path: envPath })
		console.log("✅ Loaded environment variables from .env")
	} else {
		console.log("⚠️  No .env file found - environment variables not loaded")
	}

	try {
		await registerWallet()
	} catch (error) {
		console.error("Failed to run registration:", error)
		process.exit(1)
	}
}

// Run XMTP installation revocation
async function runRevoke() {
	const inboxId = process.argv[3]

	if (!inboxId) {
		console.error("❌ InboxID is required")
		console.error("Usage: hybrid revoke <inboxId>")
		process.exit(1)
	}

	// Load environment variables from .env file
	const envPath = join(process.cwd(), ".env")
	if (existsSync(envPath)) {
		dotenv.config({ path: envPath })
		console.log("✅ Loaded environment variables from .env")
	} else {
		console.log("⚠️  No .env file found - environment variables not loaded")
	}

	try {
		await revokeInstallations(inboxId)
	} catch (error) {
		console.error("Failed to run revocation:", error)
		process.exit(1)
	}
}

// Run XMTP revoke all installations
async function runRevokeAll() {
	// Load environment variables from .env file
	const envPath = join(process.cwd(), ".env")
	if (existsSync(envPath)) {
		dotenv.config({ path: envPath })
		console.log("✅ Loaded environment variables from .env")
	} else {
		console.log("⚠️  No .env file found - environment variables not loaded")
	}

	try {
		await revokeAllInstallations()
	} catch (error) {
		console.error("Failed to run revoke all:", error)
		process.exit(1)
	}
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
				await runRegister()
			} catch (error) {
				console.error("Failed to register:", error)
				process.exit(1)
			}
			break
		case "revoke":
			try {
				await runRevoke()
			} catch (error) {
				console.error("Failed to revoke:", error)
				process.exit(1)
			}
			break
		case "revoke:all":
			try {
				await runRevokeAll()
			} catch (error) {
				console.error("Failed to revoke all:", error)
				process.exit(1)
			}
			break
		case "build":
			runBuild()
			break
		case "--help":
		case "-h":
		case "help":
			console.log("Usage: hybrid <command> or hy <command>")
			console.log("")
			console.log("Commands:")
			console.log("  init [name]  Create a new Hybrid project")
			console.log("  dev          Start development server with watch mode")
			console.log("  build        Build the TypeScript project")
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
			console.log("Environment Variables:")
			console.log(
				"  REPO         Set template repository (default: ian/hybrid)"
			)
			console.log("               Format: user/repo or user/repo#branch")
			console.log("")
			console.log("Examples:")
			console.log("  hybrid init my-agent    or    hy init my-agent")
			console.log(
				"  hybrid init             or    hy init (will prompt for name)"
			)
			console.log("  hybrid dev              or    hy dev")
			console.log("  hybrid build            or    hy build")
			console.log("  hybrid gen:keys         or    hy gen:keys")
			console.log("  hybrid gen:keys --write or    hy gen:keys --write")
			console.log("  hybrid register         or    hy register")
			console.log("  hybrid revoke <inboxId> or    hy revoke <inboxId>")
			console.log("  hybrid revoke:all       or    hy revoke:all")
			console.log("")
			break
		default:
			console.log("Usage: hybrid <command> or hy <command>")
			console.log("")
			console.log("Commands:")
			console.log("  init [name]  Create a new Hybrid project")
			console.log("  dev          Start development server with watch mode")
			console.log("  build        Build the TypeScript project")
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
			console.log("Environment Variables:")
			console.log(
				"  REPO         Set template repository (default: ian/hybrid)"
			)
			console.log("               Format: user/repo or user/repo#branch")
			console.log("")
			console.log("Examples:")
			console.log("  hybrid init my-agent    or    hy init my-agent")
			console.log(
				"  hybrid init             or    hy init (will prompt for name)"
			)
			console.log("  hybrid dev              or    hy dev")
			console.log("  hybrid build            or    hy build")
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
	process.exit(1)
})
