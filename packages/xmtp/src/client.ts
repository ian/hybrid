import { Agent, createSigner, createUser } from "@xmtp/agent-sdk"
import { ReactionCodec } from "@xmtp/content-type-reaction"
import { ReplyCodec } from "@xmtp/content-type-reply"
import { TransactionReferenceCodec } from "@xmtp/content-type-transaction-reference"
import { WalletSendCallsCodec } from "@xmtp/content-type-wallet-send-calls"
import { getRandomValues } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { fromString, toString as uint8arraysToString } from "uint8arrays"
import { createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"
import { XmtpClient, XmtpConversation, XmtpMessage } from "./types"

// ===================================================================
// Module Setup
// ===================================================================
// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ===================================================================
// Type Definitions
// ===================================================================
interface User {
	key: `0x${string}`
	account: ReturnType<typeof privateKeyToAccount>
	wallet: any // Simplified to avoid deep type instantiation
}

// ===================================================================
// User and Signer Creation
// ===================================================================
const createLocalUser = (key: string): User => {
	const account = privateKeyToAccount(key as `0x${string}`)
	return {
		key: key as `0x${string}`,
		account,
		wallet: createWalletClient({
			account,
			chain: sepolia,
			transport: http()
		})
	}
}

class XmtpAgentClient implements XmtpClient {
	private agent: any

	constructor(agent: any) {
		this.agent = agent
	}

	get address(): string {
		return this.agent.address
	}

	get inboxId(): string | undefined {
		return (this.agent as any).inboxId
	}

	get accountIdentifier(): { identifier: string } | undefined {
		return {
			identifier: this.address
		}
	}

	conversations = (() => {
		const self = this;
		
		const conversationFunction = async (): Promise<XmtpConversation[]> => {
			const conversations = await self.agent.client.conversations.list()
			return conversations.map((conv: any) => ({
				id: conv.id,
				topic: conv.topic,
				peerAddress: conv.peerAddress,
				createdAt: conv.createdAt,
				members: async () => [], // Add missing members property as function
				send: async (content: any, contentType?: any) => {
					const message = await conv.send(content)
					return {
						id: message.id,
						content: message.content,
						contentType,
						senderAddress: message.senderAddress,
						senderInboxId: (message as any).senderInboxId,
						sentAt: message.sentAt,
						conversation: conv,
						conversationId: conv.id
					}
				},
				messages: async () => {
					const messages = await conv.messages()
					return messages.map((msg: any) => ({
						id: msg.id,
						content: msg.content,
						contentType: msg.contentType,
						senderAddress: msg.senderAddress,
						senderInboxId: msg.senderInboxId,
						sentAt: msg.sentAt,
						conversation: conv,
						conversationId: conv.id
					}))
				}
			}))
		};

		conversationFunction.list = async (): Promise<XmtpConversation[]> => {
			const conversations = await self.agent.client.conversations.list()
			return conversations.map((conv: any) => ({
				id: conv.id,
				topic: conv.topic,
				peerAddress: conv.peerAddress,
				createdAt: conv.createdAt,
				members: async () => [], // Add missing members property as function
				send: async (content: any, contentType?: any) => {
					const message = await conv.send(content)
					return {
						id: message.id,
						content: message.content,
						contentType,
						senderAddress: message.senderAddress,
						senderInboxId: (message as any).senderInboxId,
						sentAt: message.sentAt,
						conversation: conv,
						conversationId: conv.id
					}
				},
				messages: async () => {
					const messages = await conv.messages()
					return messages.map((msg: any) => ({
						id: msg.id,
						content: msg.content,
						contentType: msg.contentType,
						senderAddress: msg.senderAddress,
						senderInboxId: msg.senderInboxId,
						sentAt: msg.sentAt,
						conversation: conv,
						conversationId: conv.id
					}))
				}
			}))
		};

		conversationFunction.getConversationById = async (
			conversationId: string
		): Promise<XmtpConversation | null> => {
			try {
				const conversations = await self.agent.client.conversations.list()
				const conv = conversations.find((c: any) => c.id === conversationId)
				if (!conv) return null
				
				return {
					id: conv.id,
					topic: conv.topic,
					peerAddress: conv.peerAddress,
					createdAt: conv.createdAt,
					members: async () => [], // Add missing members property as function
					send: async (content: any, contentType?: any) => {
						const message = await conv.send(content)
						return {
							id: message.id,
							content: message.content,
							contentType,
							senderAddress: message.senderAddress,
							senderInboxId: (message as any).senderInboxId,
							sentAt: message.sentAt,
							conversation: conv,
							conversationId: conv.id
						}
					},
					messages: async () => {
						const messages = await conv.messages()
						return messages.map((msg: any) => ({
							id: msg.id,
							content: msg.content,
							contentType: msg.contentType,
							senderAddress: msg.senderAddress,
							senderInboxId: msg.senderInboxId,
							sentAt: msg.sentAt,
							conversation: conv,
							conversationId: conv.id
						}))
					}
				}
			} catch (error) {
				console.error("Error getting conversation by ID:", error)
				return null
			}
		};

		conversationFunction.getMessageById = async (messageId: string): Promise<XmtpMessage | null> => {
			try {
				const conversations = await self.agent.client.conversations.list()
				for (const conv of conversations) {
					const messages = await conv.messages()
					const message = messages.find((msg: any) => msg.id === messageId)
					if (message) {
						return {
							id: message.id,
							content: message.content,
							contentType: message.contentType,
							senderAddress: message.senderAddress,
							senderInboxId: message.senderInboxId,
							sentAt: message.sentAt,
							conversation: conv,
							conversationId: conv.id
						}
					}
				}
				return null
			} catch (error) {
				console.error("Error getting message by ID:", error)
				return null
			}
		};

		conversationFunction.sync = async (): Promise<void> => {
			try {
				await self.agent.client.conversations.sync()
			} catch (error) {
				console.error("Error syncing conversations:", error)
			}
		};

		conversationFunction.streamAllMessages = async (): Promise<any> => {
			try {
				const stream = await self.agent.client.conversations.streamAllMessages()
				return {
					[Symbol.asyncIterator]: async function* () {
						for await (const message of stream) {
							yield {
								id: message.id,
								content: message.content,
								contentType: message.contentType,
								senderAddress: message.senderAddress,
								senderInboxId: message.senderInboxId,
								sentAt: message.sentAt,
								conversation: message.conversation,
								conversationId: message.conversation?.id
							}
						}
					}
				}
			} catch (error) {
				console.error("Error streaming messages:", error)
				return {
					[Symbol.asyncIterator]: async function* () {}
				}
			}
		};

		return conversationFunction;
	})()

	async conversation(peerAddress: string): Promise<XmtpConversation | null> {
		try {
			const conv = await this.agent.conversation(peerAddress)
			if (!conv) return null

			return {
				id: conv.id,
				topic: conv.topic,
				peerAddress: conv.peerAddress,
				createdAt: conv.createdAt,
				send: async (content: any, contentType?: any) => {
					const message = await conv.send(content)
					return {
						id: message.id,
						content: message.content,
						contentType,
						senderAddress: message.senderAddress,
						senderInboxId: (message as any).senderInboxId,
						sentAt: message.sentAt,
						conversation: conv,
						conversationId: conv.id
					}
				},
				messages: async () => {
					const messages = await conv.messages()
					return messages.map((msg: any) => ({
						id: msg.id,
						content: msg.content,
						contentType: msg.contentType,
						senderAddress: msg.senderAddress,
						senderInboxId: msg.senderInboxId,
						sentAt: msg.sentAt,
						conversation: conv,
						conversationId: conv.id
					}))
				},
				members: async () => {
					console.warn(
						"conversation.members() method not implemented with Agent SDK"
					)
					return []
				}
			}
		} catch (error) {
			console.error("Failed to get conversation:", error)
			return null
		}
	}

	async canMessage(peerAddress: string): Promise<boolean> {
		return await this.agent.canMessage(peerAddress)
	}

	getAgent(): any {
		return this.agent
	}

	preferences = {
		async inboxStateFromInboxIds(inboxIds: string[]): Promise<any[]> {
			console.warn(
				"inboxStateFromInboxIds() method not implemented with Agent SDK"
			)
			return []
		}
	}
}

// XMTP XmtpClient setup
// const xmtpClient: XmtpClient | null = null

// Function to clear XMTP database when hitting installation limits
async function clearXMTPDatabase(address: string, env: string) {
	console.log("🧹 Clearing XMTP database to resolve installation limit...")

	// Get the storage directory using the same logic as getDbPath
	const getStorageDirectory = () => {
		const customStoragePath = process.env.XMTP_STORAGE_PATH

		if (customStoragePath) {
			return path.isAbsolute(customStoragePath)
				? customStoragePath
				: path.resolve(process.cwd(), customStoragePath)
		}

		// Use existing logic as fallback
		const projectRoot =
			process.env.PROJECT_ROOT || path.resolve(__dirname, "../../..")

		return path.join(projectRoot, ".data/xmtp") // Local development
	}

	// Clear local database files
	const dbPattern = `${env}-${address}.db3`
	const storageDir = getStorageDirectory()

	// Primary storage directory
	const possiblePaths = [
		storageDir,
		// Legacy fallback paths for backward compatibility
		path.join(process.cwd(), ".data", "xmtp"),
		path.join(process.cwd(), "..", ".data", "xmtp"),
		path.join(process.cwd(), "..", "..", ".data", "xmtp")
	]

	for (const dir of possiblePaths) {
		try {
			if (fs.existsSync(dir)) {
				const files = fs.readdirSync(dir)
				const matchingFiles = files.filter(
					(file) =>
						file.includes(dbPattern) ||
						file.includes(address) ||
						file.includes(`xmtp-${env}-${address}`)
				)

				for (const file of matchingFiles) {
					const fullPath = path.join(dir, file)
					try {
						fs.unlinkSync(fullPath)
						console.log(`✅ Removed: ${fullPath}`)
					} catch (err) {
						console.log(`⚠️ Could not remove ${fullPath}:`, err)
					}
				}
			}
		} catch (err) {
			// Ignore errors when checking directories
		}
	}
}

export async function createXMTPClient(
	privateKey: string,
	opts?: {
		persist?: boolean
		maxRetries?: number
		storagePath?: string
	}
): Promise<XmtpClient> {
	const { persist = true, maxRetries = 3, storagePath } = opts ?? {}
	let attempt = 0

	const user = createUser(privateKey as `0x${string}`)
	const signer = createSigner(user)

	const { XMTP_ENCRYPTION_KEY, XMTP_ENV } = process.env

	while (attempt < maxRetries) {
		try {
			console.log(
				`🔄 Attempt ${attempt + 1}/${maxRetries} to create XMTP agent...`
			)

			const agentOptions: any = {
				env: XMTP_ENV || "dev",
				codecs: [
					new ReactionCodec(),
					new ReplyCodec(),
					new TransactionReferenceCodec(),
					new WalletSendCallsCodec()
				]
			}

			if (persist !== false) {
				console.log(
					`🔍 DEBUG: persist=${persist}, storagePath="${storagePath}", XMTP_ENV="${XMTP_ENV}", address="${user.account.address}"`
				)
				const dbPath = await getDbPath(
					`${XMTP_ENV || "dev"}-${user.account.address}`,
					storagePath
				)
				console.log(`🔍 DEBUG: getDbPath returned: "${dbPath}"`)
				agentOptions.dbPath = dbPath
				console.log(`📁 Using database path: ${dbPath}`)
			} else {
				agentOptions.dbPath = null
			}

			if (XMTP_ENCRYPTION_KEY) {
				agentOptions.dbEncryptionKey =
					getEncryptionKeyFromHex(XMTP_ENCRYPTION_KEY)
			}

			const agent = await Agent.create(signer, agentOptions)

			console.log("✅ XMTP Agent created")
			console.log(`🔑 Wallet address: ${user.account.address}`)
			console.log(`🌐 Environment: ${XMTP_ENV || "dev"}`)
			console.log(`💾 Storage mode: ${persist ? "persistent" : "in-memory"}`)

			return new XmtpAgentClient(agent)
		} catch (error) {
			attempt++
			console.error(
				`Failed to create XMTP agent (attempt ${attempt}/${maxRetries}):`,
				error
			)

			if (attempt >= maxRetries) {
				console.error(
					"🚨 XMTP client creation failed after all retries. Forcing process exit..."
				)
				process.exit(1) // Force exit immediately
			}

			await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
		}
	}

	throw new Error("Max retries exceeded")
}

// ===================================================================
// Encryption Key Management
// ===================================================================
/**
 * Generate a random encryption key
 * @returns The encryption key as a hex string
 */
export const generateEncryptionKeyHex = () => {
	const uint8Array = getRandomValues(new Uint8Array(32))
	return uint8arraysToString(uint8Array, "hex")
}

/**
 * Get the encryption key from a hex string
 * @param hex - The hex string
 * @returns The encryption key as Uint8Array
 */
export const getEncryptionKeyFromHex = (hex: string): Uint8Array => {
	return fromString(hex, "hex")
}

// ===================================================================
// Database Path Management
// ===================================================================
export const getDbPath = async (description = "xmtp", storagePath?: string) => {
	// Allow custom storage path via environment variable
	const customStoragePath = process.env.XMTP_STORAGE_PATH

	let volumePath: string

	if (customStoragePath) {
		// Use custom storage path if provided
		volumePath = path.isAbsolute(customStoragePath)
			? customStoragePath
			: path.resolve(process.cwd(), customStoragePath)
	} else if (storagePath) {
		volumePath = path.isAbsolute(storagePath)
			? storagePath
			: path.resolve(process.cwd(), storagePath)
	} else {
		// Use existing logic as fallback
		const projectRoot =
			process.env.PROJECT_ROOT || path.resolve(__dirname, "../../..")

		// Default storage path for local development
		volumePath = path.join(projectRoot, ".data/xmtp")
	}

	const dbPath = `${volumePath}/${description}.db3`

	// Ensure the directory exists before any operations
	if (!fs.existsSync(volumePath)) {
		fs.mkdirSync(volumePath, { recursive: true })
		console.log(`📁 Created directory: ${volumePath}`)
	}

	if (typeof globalThis !== "undefined" && "XMTP_STORAGE" in globalThis) {
		try {
			console.log(`📦 Using Cloudflare R2 storage for: ${dbPath}`)

			const r2Bucket = (globalThis as any).XMTP_STORAGE
			const remotePath = `xmtp-databases/${description}.db3`

			try {
				const existingObject = await r2Bucket.head(remotePath)
				if (existingObject) {
					console.log(`📥 Downloading existing database from R2 storage...`)

					const object = await r2Bucket.get(remotePath)
					if (object) {
						const fileData = await object.arrayBuffer()
						fs.writeFileSync(dbPath, new Uint8Array(fileData))
						console.log(`✅ Database downloaded from R2 storage`)
					}
				} else {
					console.log(`📝 No existing database found in R2 storage`)
				}
			} catch (error) {
				console.log(`⚠️ Failed to download database from R2 storage:`, error)
			}
		} catch (error) {
			console.log(`⚠️ R2 storage not available:`, error)
		}
	}

	return dbPath
}

export const backupDbToPersistentStorage = async (
	dbPath: string,
	description: string
) => {
	if (
		typeof globalThis !== "undefined" &&
		"XMTP_STORAGE" in globalThis &&
		fs.existsSync(dbPath)
	) {
		try {
			console.log(`📦 Backing up database to R2 storage: ${dbPath}`)

			const r2Bucket = (globalThis as any).XMTP_STORAGE
			const remotePath = `xmtp-databases/${description}.db3`

			const fileData = fs.readFileSync(dbPath)
			await r2Bucket.put(remotePath, fileData)
			console.log(`✅ Database backed up to R2 storage: ${remotePath}`)
		} catch (error) {
			console.log(`⚠️ Failed to backup database to R2 storage:`, error)
		}
	}
}

// ===================================================================
// Logging and Debugging
// ===================================================================
export const logAgentDetails = async (
	clients: XmtpClient | XmtpClient[]
): Promise<void> => {
	const clientArray = Array.isArray(clients) ? clients : [clients]

	for (const client of clientArray) {
		const address = client.address
		console.log(`\x1b[38;2;252;76;52m
        ██╗  ██╗███╗   ███╗████████╗██████╗ 
        ╚██╗██╔╝████╗ ████║╚══██╔══╝██╔══██╗
         ╚███╔╝ ██╔████╔██║   ██║   ██████╔╝
         ██╔██╗ ██║╚██╔╝██║   ██║   ██╔═══╝ 
        ██╔╝ ██╗██║ ╚═╝ ██║   ██║   ██║     
        ╚═╝  ╚═╝╚═╝     ╚═╝   ╚═╝   ╚═╝     
      \x1b[0m`)

		const urls = [`http://xmtp.chat/dm/${address}`]
		const conversations = await client.conversations()

		console.log(`
    ✓ XMTP Agent Client:
    • Address: ${address}
    • Conversations: ${conversations?.length}
    ${urls.map((url) => `• URL: ${url}`).join("\n")}`)
	}
}

// ===================================================================
// Environment Validation
// ===================================================================
export function validateEnvironment(vars: string[]): Record<string, string> {
	const missing = vars.filter((v) => !process.env[v])

	if (missing.length) {
		try {
			const envPath = path.resolve(process.cwd(), ".env")
			if (fs.existsSync(envPath)) {
				const envVars = fs
					.readFileSync(envPath, "utf-8")
					.split("\n")
					.filter((line) => line.trim() && !line.startsWith("#"))
					.reduce<Record<string, string>>((acc, line) => {
						const [key, ...val] = line.split("=")
						if (key && val.length) acc[key.trim()] = val.join("=").trim()
						return acc
					}, {})

				missing.forEach((v) => {
					if (envVars[v]) process.env[v] = envVars[v]
				})
			}
		} catch (e) {
			console.error(e)
			/* ignore errors */
		}

		const stillMissing = vars.filter((v) => !process.env[v])
		if (stillMissing.length) {
			console.error("Missing env vars:", stillMissing.join(", "))
			process.exit(1)
		}
	}

	return vars.reduce<Record<string, string>>((acc, key) => {
		acc[key] = process.env[key] as string
		return acc
	}, {})
}

/**
 * Diagnose XMTP environment and identity issues
 */
export async function diagnoseXMTPIdentityIssue(
	client: XmtpClient,
	inboxId: string,
	environment: string
): Promise<{
	canResolve: boolean
	suggestions: string[]
	details: Record<string, any>
}> {
	const suggestions: string[] = []
	const details: Record<string, any> = {
		environment,
		inboxId,
		timestamp: new Date().toISOString()
	}

	try {
		console.log("Inbox state resolution not available in Agent SDK")
		suggestions.push("Inbox state resolution not available with Agent SDK")
		details.inboxStateFound = false
		return { canResolve: false, suggestions, details }
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		details.error = errorMessage

		if (errorMessage.includes("Association error")) {
			suggestions.push("XMTP identity association error detected")
			suggestions.push(
				"Check if user exists on the correct XMTP environment (dev vs production)"
			)
			suggestions.push(
				"Identity may need to be recreated on the current environment"
			)
		}

		if (errorMessage.includes("Missing identity update")) {
			suggestions.push("Missing identity updates in XMTP network")
			suggestions.push("This can indicate network sync issues")
			suggestions.push("Wait a few minutes and retry, or recreate identity")
		}

		if (errorMessage.includes("database") || errorMessage.includes("storage")) {
			suggestions.push("XMTP local database/storage issue")
			suggestions.push("Try clearing XMTP database and resyncing")
			suggestions.push("Check .data/xmtp directory permissions")
		}

		suggestions.push("Consider testing with a fresh XMTP identity")
		return { canResolve: false, suggestions, details }
	}
}

// ===================================================================
// Enhanced Connection Management & Health Monitoring
// ===================================================================

export interface XMTPConnectionConfig {
	maxRetries?: number
	retryDelayMs?: number
	healthCheckIntervalMs?: number
	connectionTimeoutMs?: number
	reconnectOnFailure?: boolean
}

export interface XMTPConnectionHealth {
	isConnected: boolean
	lastHealthCheck: Date
	consecutiveFailures: number
	totalReconnects: number
	avgResponseTime: number
}

export class XMTPConnectionManager {
	private client: XmtpClient | null = null
	private privateKey: string
	private config: Required<XMTPConnectionConfig>
	private health: XMTPConnectionHealth
	private healthCheckTimer: NodeJS.Timeout | null = null
	private isReconnecting = false

	constructor(privateKey: string, config: XMTPConnectionConfig = {}) {
		this.privateKey = privateKey
		this.config = {
			maxRetries: config.maxRetries ?? 5,
			retryDelayMs: config.retryDelayMs ?? 1000,
			healthCheckIntervalMs: config.healthCheckIntervalMs ?? 30000,
			connectionTimeoutMs: config.connectionTimeoutMs ?? 10000,
			reconnectOnFailure: config.reconnectOnFailure ?? true
		}

		this.health = {
			isConnected: false,
			lastHealthCheck: new Date(),
			consecutiveFailures: 0,
			totalReconnects: 0,
			avgResponseTime: 0
		}
	}

	async connect(persist = false): Promise<XmtpClient> {
		if (this.client && this.health.isConnected) {
			return this.client
		}

		let attempt = 0
		while (attempt < this.config.maxRetries) {
			try {
				console.log(
					`🔄 XMTP connection attempt ${attempt + 1}/${this.config.maxRetries}`
				)

				this.client = await createXMTPClient(this.privateKey, { persist })
				this.health.isConnected = true
				this.health.consecutiveFailures = 0

				// Start health monitoring
				this.startHealthMonitoring()

				console.log("✅ XMTP client connected successfully")
				return this.client
			} catch (error) {
				attempt++
				this.health.consecutiveFailures++

				console.error(`❌ XMTP connection attempt ${attempt} failed:`, error)

				if (attempt < this.config.maxRetries) {
					const delay = this.config.retryDelayMs * Math.pow(2, attempt - 1)
					console.log(`⏳ Retrying in ${delay}ms...`)
					await this.sleep(delay)
				}
			}
		}

		throw new Error(
			`Failed to connect to XMTP after ${this.config.maxRetries} attempts`
		)
	}

	// private async createClientWithTimeout(persist: boolean): Promise<XmtpClient> {
	//   const timeoutPromise = new Promise<never>((_, reject) => {
	//     setTimeout(
	//       () => reject(new Error("Connection timeout")),
	//       this.config.connectionTimeoutMs
	//     )
	//   })

	//   const clientPromise = createXMTPClient(this.signer, { persist })

	//   return Promise.race([clientPromise, timeoutPromise])
	// }

	private startHealthMonitoring(): void {
		if (this.healthCheckTimer) {
			clearInterval(this.healthCheckTimer)
		}

		this.healthCheckTimer = setInterval(() => {
			this.performHealthCheck()
		}, this.config.healthCheckIntervalMs)
	}

	private async performHealthCheck(): Promise<void> {
		if (!this.client) return

		const startTime = Date.now()

		try {
			// Simple health check: try to list conversations
			await this.client.conversations()

			const responseTime = Date.now() - startTime
			this.health.avgResponseTime =
				(this.health.avgResponseTime + responseTime) / 2
			this.health.lastHealthCheck = new Date()
			this.health.consecutiveFailures = 0
			this.health.isConnected = true

			console.log(`💓 XMTP health check passed (${responseTime}ms)`)
		} catch (error) {
			this.health.consecutiveFailures++
			this.health.isConnected = false

			console.error(`💔 XMTP health check failed:`, error)

			// Trigger reconnection if enabled
			if (this.config.reconnectOnFailure && !this.isReconnecting) {
				this.handleConnectionFailure()
			}
		}
	}

	private async handleConnectionFailure(): Promise<void> {
		if (this.isReconnecting) return

		this.isReconnecting = true
		this.health.totalReconnects++

		console.log("🔄 XMTP connection lost, attempting to reconnect...")

		try {
			this.client = null
			await this.connect()
			console.log("✅ XMTP reconnection successful")
		} catch (error) {
			console.error("❌ XMTP reconnection failed:", error)
		} finally {
			this.isReconnecting = false
		}
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	getHealth(): XMTPConnectionHealth {
		return { ...this.health }
	}

	getClient(): XmtpClient | null {
		return this.client
	}

	async disconnect(): Promise<void> {
		if (this.healthCheckTimer) {
			clearInterval(this.healthCheckTimer)
			this.healthCheckTimer = null
		}

		this.client = null
		this.health.isConnected = false
		console.log("🔌 XMTP client disconnected")
	}
}

// Enhanced client creation with connection management
export async function createXMTPConnectionManager(
	privateKey: string,
	config?: XMTPConnectionConfig
): Promise<XMTPConnectionManager> {
	const manager = new XMTPConnectionManager(privateKey, config)
	await manager.connect()
	return manager
}

// ===================================================================
// User Address Resolution with Auto-Refresh
// ===================================================================

/**
 * Resolve user address from inbox ID with automatic identity refresh on association errors
 */
export async function resolveUserAddress(
	client: XmtpClient,
	senderInboxId: string,
	maxRetries = 2
): Promise<string> {
	let attempt = 0

	while (attempt < maxRetries) {
		try {
			console.log(
				`🔍 Resolving user address (attempt ${attempt + 1}/${maxRetries})...`
			)

			console.log("Inbox state resolution not available in Agent SDK")
			return "unknown"
		} catch (error) {
			attempt++

			if (
				error instanceof Error &&
				error.message.includes("Association error: Missing identity update")
			) {
				console.log(
					`🔄 Identity association error during address resolution (attempt ${attempt}/${maxRetries})`
				)

				if (attempt < maxRetries) {
					console.log(
						"🔧 Attempting automatic identity refresh for address resolution..."
					)

					try {
						// Force a conversation sync to refresh identity state
						console.log("📡 Syncing conversations to refresh identity...")
						console.log("Conversation sync handled automatically by Agent SDK")

						// Small delay before retry
						console.log("⏳ Waiting 2s before retry...")
						await new Promise((resolve) => setTimeout(resolve, 2000))

						console.log(
							"✅ Identity sync completed, retrying address resolution..."
						)
					} catch (refreshError) {
						console.log(`❌ Identity refresh failed:`, refreshError)
					}
				} else {
					console.error("❌ Failed to resolve user address after all retries")
					console.error("💡 Identity association issue persists")

					// Run diagnostic
					try {
						const diagnosis = await diagnoseXMTPIdentityIssue(
							client,
							senderInboxId,
							process.env.XMTP_ENV || "dev"
						)

						console.log("🔍 XMTP Identity Diagnosis:")
						diagnosis.suggestions.forEach((suggestion) => {
							console.error(`💡 ${suggestion}`)
						})
					} catch (diagError) {
						console.warn("⚠️ Could not run XMTP identity diagnosis:", diagError)
					}

					return "unknown"
				}
			} else {
				// For other errors, don't retry
				console.error("❌ Error resolving user address:", error)
				return "unknown"
			}
		}
	}

	return "unknown"
}

export const startPeriodicBackup = (
	dbPath: string,
	description: string,
	intervalMs = 300000
) => {
	return setInterval(async () => {
		try {
			await backupDbToPersistentStorage(dbPath, description)
		} catch (error) {
			console.log(`⚠️ Periodic backup failed:`, error)
		}
	}, intervalMs)
}
