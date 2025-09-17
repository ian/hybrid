import { getRandomValues } from "node:crypto"
import { writeFile } from "node:fs/promises"
import { toString as uint8ToString } from "uint8arrays"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"

// Generate a random encryption key
function generateEncryptionKeyHex() {
	const uint8Array = getRandomValues(new Uint8Array(32))
	return uint8ToString(uint8Array, "hex")
}

// Generate keys and display them for manual addition to .env
export async function generateKeys(writeToFile = false) {
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
XMTP_DB_ENCRYPTION_KEY=${encryptionKeyHex}
XMTP_ENV=production

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
			console.log(`XMTP_DB_ENCRYPTION_KEY=${encryptionKeyHex}`)
			console.log(`XMTP_ENV=production`)
			console.log("=".repeat(60))
		}
	} else {
		console.log(`XMTP_WALLET_KEY=${walletKey}`)
		console.log(`XMTP_DB_ENCRYPTION_KEY=${encryptionKeyHex}`)
		console.log(`XMTP_ENV=production`)
		console.log(`\n# Your public key (wallet address): ${publicKey}`)
	}

	console.log(
		"\n⚠️  Keep these keys secure and never commit them to version control!"
	)
}
