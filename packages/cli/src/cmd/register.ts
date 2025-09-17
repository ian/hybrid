import {
	createXMTPClient,
	createXMTPSigner,
	logAgentDetails,
	validateEnvironment
} from "@hybrd/xmtp"
import dotenv from "dotenv"
import { existsSync } from "node:fs"
import { join } from "node:path"

// Register wallet with XMTP network
export async function registerWallet() {
	console.log("🚀 Starting XMTP Production Network Registration...")

	// Load environment variables from .env file
	const envPath = join(process.cwd(), ".env")
	if (existsSync(envPath)) {
		dotenv.config({ path: envPath })
		console.log("✅ Loaded environment variables from .env")
	} else {
		console.log("⚠️  No .env file found - environment variables not loaded")
	}

	// Validate required environment variables
	const { XMTP_WALLET_KEY } = validateEnvironment([
		"XMTP_WALLET_KEY",
		"XMTP_DB_ENCRYPTION_KEY"
	])

	if (!XMTP_WALLET_KEY) {
		console.error("❌ XMTP_WALLET_KEY is required for registration")
		console.log("💡 Run 'hybrid keys --write' to generate keys first")
		process.exit(1)
	}

	try {
		console.log("🔑 Creating signer...")
		const signer = createXMTPSigner(XMTP_WALLET_KEY)

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
