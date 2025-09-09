import { createXMTPClient } from "@hybrd/xmtp"
import dotenv from "dotenv"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { revokeInstallations } from "./revoke.js"

// Revoke ALL XMTP installations for current wallet
export async function revokeAllInstallations() {
	console.log("🔄 Revoking ALL XMTP Installations")
	console.log("==================================")

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
		console.log(`🌐 Environment: ${process.env.XMTP_ENV || "dev"}`)

		// Try to create client to get current inbox ID
		try {
			const client = await createXMTPClient(XMTP_WALLET_KEY)
			const currentInboxId = client.inboxId

			if (!currentInboxId) {
				throw new Error("Could not get inbox ID from client")
			}

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
