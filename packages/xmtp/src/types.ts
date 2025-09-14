/**
 * @fileoverview XMTP Types
 *
 * Type definitions for both the XMTP core client and service client library.
 */

import { GroupUpdated } from "@xmtp/content-type-group-updated"
import { Reaction } from "@xmtp/content-type-reaction"
import { Reply } from "@xmtp/content-type-reply"
import { TransactionReference } from "@xmtp/content-type-transaction-reference"
import { WalletSendCallsParams } from "@xmtp/content-type-wallet-send-calls"
import type { Resolver } from "./resolver/resolver"

export type HonoVariables = {
	xmtpClient: XmtpClient
	resolver?: Resolver
}

// ===================================================================
// XMTP Core Client Types
// ===================================================================

type Codec =
	| GroupUpdated
	| Reaction
	| Reply
	| TransactionReference
	| WalletSendCallsParams

export interface XmtpClient {
	address: string
	inboxId?: string
	accountIdentifier?: {
		identifier: string
	}
	conversations: (() => Promise<XmtpConversation[]>) & {
		list(): Promise<XmtpConversation[]>
		getConversationById(conversationId: string): Promise<XmtpConversation | null>
		getMessageById(messageId: string): Promise<XmtpMessage | null>
		sync(): Promise<void>
		streamAllMessages(): Promise<any>
	}
	conversation(peerAddress: string): Promise<XmtpConversation | null>
	canMessage(peerAddress: string): Promise<boolean>
	getAgent?(): any
	preferences: {
		inboxStateFromInboxIds(inboxIds: string[]): Promise<any[]>
	}
}

export interface XmtpConversation {
	id: string
	topic: string
	peerAddress: string
	createdAt: Date
	send(content: any, contentType?: any): Promise<XmtpMessage>
	messages(): Promise<XmtpMessage[]>
	members(): Promise<any[]>
}

export interface XmtpMessage {
	id: string
	content: any
	contentType?: any
	senderAddress: string
	senderInboxId?: string
	sentAt: Date
	conversation: any
	conversationId?: string
}

// MessageListenerConfig moved to ./lib/message-listener.ts to avoid duplicate exports

export type XmtpSender = {
	address: string
	inboxId: string
	name: string
	basename?: string
}
export type XmtpSubjects = Record<string, `0x${string}`>

export interface MessageEvent {
	conversation: XmtpConversation
	message: XmtpMessage
	rootMessage: XmtpMessage
	parentMessage?: XmtpMessage // The directly referenced message if this is a reply
	sender: XmtpSender
	subjects: XmtpSubjects
}

// ===================================================================
// XMTP Service Client Types
// ===================================================================

export interface XmtpServiceClientConfig {
	serviceUrl: string
	serviceToken: string
}

export interface TransactionCall {
	to: string
	data: string
	gas?: string
	value?: string
	metadata?: Record<string, unknown>
}

export interface TransactionRequest {
	fromAddress: string
	chainId: string
	calls: TransactionCall[]
}

export interface XmtpServiceResponse<T = unknown> {
	success: boolean
	data?: T
	error?: string
}

export interface XmtpServiceMessage {
	id: string
	conversationId: string
	content: string | Record<string, unknown>
	senderInboxId: string
	sentAt: string
	contentType?: {
		typeId: string
		authorityId?: string
		versionMajor?: number
		versionMinor?: number
	}
}

export interface XmtpRootMessageResponse {
	id: string
	conversationId: string
	content: string | Record<string, unknown>
	senderInboxId: string
	sentAt: string
	contentType?: {
		typeId: string
		authorityId?: string
		versionMajor?: number
		versionMinor?: number
	}
}

// Function parameter types
export interface SendMessageParams {
	content: string
}

export interface SendReplyParams {
	content: string
	messageId: string
}

export interface SendReactionParams {
	messageId: string
	emoji: string
	action: "added" | "removed"
}

export interface SendTransactionParams extends TransactionRequest {}

export interface GetMessageParams {
	messageId: string
}

export interface GetRootMessageParams {
	messageId: string
}

// Response types
export interface SendMessageResponse {
	success: boolean
	action: "send"
	conversationId: string
}

export interface SendReplyResponse {
	success: boolean
	action: "reply"
	conversationId: string
}

export interface SendReactionResponse {
	success: boolean
	action: "react"
	conversationId: string
}

export interface SendTransactionResponse {
	success: boolean
	action: "transaction"
	conversationId: string
}
