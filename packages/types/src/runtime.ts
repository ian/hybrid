import type {
	XmtpClient,
	XmtpSender,
	XmtpSubjects,
	XmtpConversation,
	XmtpMessage
} from "./xmtp"

/**
 * Base runtime that is always included in agents and tools.
 * Additional fields can be added via generic type parameters as intersections.
 *
 * Example usage:
 * - Basic: AgentRuntime (just chatId and messages)
 * - Extended: AgentRuntime & { userId: string } (adds userId field)
 */
export interface AgentRuntime {
	conversation: XmtpConversation
	message: XmtpMessage
	sender: XmtpSender
	subjects: XmtpSubjects
	xmtpClient: XmtpClient
}

// export type AgentRuntime = BaseRuntime & {
// 	chatId?: string
// 	messages: Array<UIMessage>
// }
