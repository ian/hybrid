import { Signer } from "@xmtp/node-sdk"
import { createXMTPClient, validateEnvironment } from "../src/client"
import { revokeOldInstallations } from "./revoke-installations"

async function revokeAllInstallations() {
  console.log("🔄 Revoking ALL XMTP Installations")
  console.log("==================================")

  // Validate environment
  const { XMTP_WALLET_KEY } = validateEnvironment(["XMTP_WALLET_KEY"])

  if (!XMTP_WALLET_KEY) {
    console.error("❌ XMTP_WALLET_KEY is required")
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

      const success = await revokeOldInstallations(
        client.signer as Signer,
        currentInboxId
      )

      // Create signer
      console.log(`🔑 Wallet Address: ${client.accountIdentifier?.identifier}`)

      if (success) {
        console.log("✅ Successfully revoked all installations")
      } else {
        console.log("❌ Failed to revoke installations")
        process.exit(1)
      }
    } catch (clientError) {
      console.log(
        "⚠️ Could not create client, attempting alternative approach..."
      )

      // If we can't create a client, it might be because of installation limits
      // Try to manually construct possible inbox IDs or use a different approach
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
      } else if (error.message.includes("Missing existing member")) {
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

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  revokeAllInstallations().catch((error) => {
    console.error("💥 Fatal error:", error)
    process.exit(1)
  })
}

export { revokeAllInstallations }
