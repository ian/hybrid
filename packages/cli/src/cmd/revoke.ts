import { createUser, createSigner } from "@hybrd/xmtp"
import dotenv from "dotenv"
import { existsSync } from "node:fs"
import { join } from "node:path"

// Revoke XMTP installations for specific inbox
export async function revokeInstallations(inboxId: string) {
	console.log(`🔧 Revoking XMTP installations for inbox: ${inboxId}`)

	// Load environment variables from .env file
	const envPath = join(process.cwd(), ".env")
	if (existsSync(envPath)) {
		dotenv.config({ path: envPath })
		console.log("✅ Loaded environment variables from .env")
	} else {
		console.log("⚠️  No .env file found - environment variables not loaded")
	}

	const { XMTP_WALLET_KEY } = process.env

	if (!XMTP_WALLET_KEY) {
		console.error("❌ XMTP_WALLET_KEY is required")
		console.log("💡 Run 'hybrid keys --write' to generate keys first")
		process.exit(1)
	}

	try {
		const privateKeyHex = XMTP_WALLET_KEY.startsWith('0x') ? XMTP_WALLET_KEY as `0x${string}` : `0x${XMTP_WALLET_KEY}` as `0x${string}`
		const user = createUser(privateKeyHex)
		const signer = createSigner(user)
		const identifier = await signer.getIdentifier()
		const address = identifier.identifier

		console.log(`🔑 Wallet Address: ${address}`)
		console.log(`📋 Inbox ID: ${inboxId}`)

		console.log("⚠️ Revoke functionality is not available in the Agent SDK")
		console.log("The Agent SDK does not support inbox state queries or installation revocation")
		console.log("This functionality may need to be implemented using the node-sdk directly")
		console.log("or may not be needed with the new Agent SDK architecture")
		
		console.log(`📋 Would have revoked installations for inbox ID: ${inboxId}`)
		console.log("✅ Operation completed (no-op with Agent SDK)")
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
