// ===================================================================
// XMTP Package - Main Entry Point
// ===================================================================
// This package provides a clean interface to XMTP functionality
// Re-exports core XMTP SDK types and utilities

export * from "./client"
export * from "./constants"
export * from "./lib/message-listener"
// export * from "./lib/agent-message-listener" // Temporarily disabled due to missing @xmtp/agent-sdk dependency
export * from "./lib/subjects"
export * from "./resolver"
export * from "./resolver/basename-resolver"
export * from "./resolver/ens-resolver"
export * from "./resolver/xmtp-resolver"
export * from "./service-client"
export * from "./types"

// ===================================================================
// XMTP Plugin for Agent Integration
// ===================================================================
export { XMTPPlugin } from "./plugin"
export type { Plugin, XMTPPluginContext } from "./plugin"

// ===================================================================
// JWT Utilities for XMTP Tools
// ===================================================================
export { generateXMTPToolsToken } from "./lib/jwt"
export type { XMTPToolsPayload } from "./lib/jwt"

// ===================================================================
// Enhanced XMTP Client & Connection Management
// ===================================================================
export {
	// Enhanced connection management
	XMTPConnectionManager,
	createXMTPConnectionManager,
	type XMTPConnectionConfig,
	type XMTPConnectionHealth
} from "./client"

// ===================================================================
// XMTP Service Client (for external service communication)
// ===================================================================
export {
	XmtpServiceClient,
	createXmtpServiceClient
} from "./service-client"

// Service Client Types
export type {
	GetMessageParams,
	GetRootMessageParams,
	// Function parameter types
	SendMessageParams,
	// Response types
	SendMessageResponse,
	SendReactionParams,
	SendReactionResponse,
	SendReplyParams,
	SendReplyResponse,
	SendTransactionParams,
	SendTransactionResponse,
	TransactionCall,
	TransactionRequest,
	XmtpRootMessageResponse,
	XmtpServiceClientConfig,
	XmtpServiceMessage,
	XmtpServiceResponse
} from "./types"

// ===================================================================
// XMTP Agent SDK Exports
// ===================================================================
export {
	Agent,
	createSigner,
	createUser
} from "@xmtp/agent-sdk"

// ===================================================================
// XMTP Content Types
// ===================================================================
export {
	ContentTypeTransactionReference,
	type TransactionReference
} from "@xmtp/content-type-transaction-reference"

export { ContentTypeText, type TextParameters } from "@xmtp/content-type-text"

export {
	ContentTypeReaction,
	type Reaction
} from "@xmtp/content-type-reaction"

export {
	ContentTypeReply,
	ReplyCodec,
	type Reply
} from "@xmtp/content-type-reply"

export {
	ContentTypeGroupUpdated,
	GroupUpdatedCodec,
	type GroupUpdated
} from "@xmtp/content-type-group-updated"

export {
	ContentTypeWalletSendCalls,
	type WalletSendCallsParams
} from "@xmtp/content-type-wallet-send-calls"

// ===================================================================
// Local Client Utilities
// ===================================================================
export {
	backupDbToPersistentStorage,
	createXMTPClient,
	diagnoseXMTPIdentityIssue,
	generateEncryptionKeyHex,
	getEncryptionKeyFromHex,
	logAgentDetails,
	startPeriodicBackup,
	validateEnvironment
} from "./client"

// ===================================================================
// Application Constants
// ===================================================================
export {
	DEFAULT_AMOUNT,
	DEFAULT_OPTIONS,
	MAX_USDC_AMOUNT
} from "./constants"
