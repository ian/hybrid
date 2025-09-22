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
import { Client, Conversation, DecodedMessage } from "@xmtp/node-sdk"
import type { Resolver } from "./resolver"

export type HonoVariables = {
	xmtpClient: XmtpClient
	resolver?: Resolver
}

type Codec =
	| GroupUpdated
	| Reaction
	| Reply
	| TransactionReference
	| WalletSendCallsParams

export type XmtpClient = Client<unknown>
export type XmtpConversation = Conversation<unknown>
export type XmtpMessage = DecodedMessage<unknown>
export type XmtpSender = {
	address: string
	inboxId: string
	name: string
	basename?: string
}
export type XmtpSubjects = Record<string, `0x${string}`>
