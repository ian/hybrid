import { Client, Signer, createSigner } from "../src/index"

// Function to revoke old installations when hitting the limit
export async function revokeOldInstallations(signer: Signer, inboxId?: string) {
  console.log("🔧 Attempting to revoke old installations...")

  try {
    // If we don't have the inboxId, we need to extract it from a temporary client attempt
    if (!inboxId) {
      console.log("ℹ️ No inboxId provided, cannot revoke installations")
      return false
    }

    const inboxStates = await Client.inboxStateFromInboxIds(
      [inboxId],
      process.env.XMTP_ENV as "dev" | "production"
    )

    if (!inboxStates[0]) {
      console.log("❌ No inbox state found for the provided inboxId")
      return false
    }

    const toRevokeInstallationBytes = inboxStates[0].installations.map(
      (i) => i.bytes
    )

    await Client.revokeInstallations(
      signer,
      inboxId,
      toRevokeInstallationBytes,
      process.env.XMTP_ENV as "dev" | "production"
    )

    const resultingStates = await Client.inboxStateFromInboxIds(
      [inboxId],
      process.env.XMTP_ENV as "dev" | "production"
    )

    console.log(
      `📋 Revoked installations: ${toRevokeInstallationBytes.length} installations`
    )
    console.log(
      `📋 Resulting state: ${resultingStates[0]?.installations.length || 0} installations`
    )

    return true
  } catch (error) {
    console.error("❌ Error during installation revocation:", error)
    return false
  }
}

// CLI script to revoke installations
async function main() {
  const { XMTP_WALLET_KEY } = process.env
  const inboxId = process.argv[2]

  if (!XMTP_WALLET_KEY) {
    console.error("❌ XMTP_WALLET_KEY is required")
    process.exit(1)
  }

  if (!inboxId) {
    console.error("❌ InboxID is required as CLI argument")
    console.error("Usage: tsx revoke-installations.ts <inboxId>")
    process.exit(1)
  }

  const signer = createSigner(XMTP_WALLET_KEY)
  const identifier = await signer.getIdentifier()
  const address = identifier.identifier

  console.log(`🔑 Wallet Address: ${address}`)
  console.log(`📋 Inbox ID: ${inboxId}`)

  // Try to revoke installations
  const success = await revokeOldInstallations(signer, inboxId)

  if (success) {
    console.log("✅ Successfully revoked installations")
  } else {
    console.log("❌ Failed to revoke installations")
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error)
    process.exit(1)
  })
}
