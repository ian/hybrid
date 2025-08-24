import { createSigner, createXMTPClient, getDbPath, logAgentDetails, validateEnvironment } from "../src/client"

async function registerOnProduction() {
  console.log("🚀 Starting XMTP Production Network Registration...")

  // Validate required environment variables
  const { XMTP_WALLET_KEY } = validateEnvironment([
    "XMTP_WALLET_KEY",
    "XMTP_ENCRYPTION_KEY"
  ])

  if (!XMTP_WALLET_KEY) {
    console.error("❌ XMTP_WALLET_KEY is required for registration")
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

    // Use getDbPath to ensure directory creation and proper path handling
    const dbPath = getDbPath(`production-${address}`)
    console.log(`📁 Database path: ${dbPath}`)

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
✓ Database: production-${address}.db3
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
      } else if (
        error.message.includes("database") ||
        error.message.includes("Unable to open")
      ) {
        console.log(
          "💾 Database access issue. Please check file permissions and ensure the directory exists."
        )
      } else {
        console.log("💡 Make sure your wallet is connected and try again.")
      }
    }

    process.exit(1)
  }
}

// Run registration
registerOnProduction().catch((error) => {
  console.error("💥 Fatal error during registration:", error)
  process.exit(1)
})
