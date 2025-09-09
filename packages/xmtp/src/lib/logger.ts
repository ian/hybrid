/**
 * Logger instance for conditional XMTP debug logging
 * Only logs when XMTP_DEBUG environment variable is set
 */
export const logger = {
	debug: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && process.env?.XMTP_DEBUG) {
			console.log(message, ...args)
		}
	},
	error: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && process.env?.XMTP_DEBUG) {
			console.error(message, ...args)
		}
	}
}
