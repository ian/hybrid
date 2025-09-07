import { Client, createSigner } from "@hybrd/xmtp"
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
