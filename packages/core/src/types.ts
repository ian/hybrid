import { UIMessage } from "ai"

/**
 * Base runtime that is always included in agents and tools.
 * Additional fields can be added via generic type parameters as intersections.
 *
 * Example usage:
 * - Basic: AgentRuntime (just chatId and messages)
 * - Extended: AgentRuntime & { userId: string } (adds userId field)
 */
import type {
	XmtpClient,
	XmtpConversation,
	XmtpMessage,
	XmtpSender,
	XmtpSubjects
} from "@hybrd/xmtp"

export interface BaseRuntime extends Record<string, unknown> {
	conversation: XmtpConversation
	message: XmtpMessage
	parentMessage?: XmtpMessage
	rootMessage: XmtpMessage
	sender: XmtpSender
	subjects: XmtpSubjects
	xmtpClient: XmtpClient
}

export type AgentRuntime = BaseRuntime & {
	chatId?: string
	messages: Array<UIMessage>
}

export interface XmtpCredentials {
	inboxId: string
	xmtpServiceUrl: string
	xmtpServiceToken: string
}
