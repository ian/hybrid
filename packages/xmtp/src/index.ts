export { Agent, createSigner, createUser, getTestUrl } from "@xmtp/agent-sdk"

export type * from "./types"

export {
	DEFAULT_AMOUNT,
	DEFAULT_OPTIONS,
	MAX_USDC_AMOUNT
} from "./constants"

// ===================================================================
// XMTP Client and Connection Management
// ===================================================================
export {
	createXMTPClient,
	XMTPConnectionManager,
	logAgentDetails,
	validateEnvironment
} from "./client"
export type { XMTPConnectionConfig } from "./client"

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
export { logger } from "./lib/logger"

// ===================================================================
// XMTP Core SDK Exports
// ===================================================================
export {
	Client,
	IdentifierKind,
	// type Conversation,
	type DecodedMessage,
	type Dm,
	// type Group,
	type LogLevel,
	type Signer,
	type XmtpEnv
} from "@xmtp/node-sdk"

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
