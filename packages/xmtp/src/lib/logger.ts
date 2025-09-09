/**
 * Logger instance for conditional XMTP debug logging
 * Only logs when XMTP_DEBUG environment variable is set
 * Compatible with common logger interfaces
 */
export const logger = {
	debug: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && process.env?.XMTP_DEBUG) {
			console.log(message, ...args)
		}
	},
	log: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && process.env?.XMTP_DEBUG) {
			console.log(message, ...args)
		}
	},
	info: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && process.env?.XMTP_DEBUG) {
			console.info(message, ...args)
		}
	},
	warn: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && process.env?.XMTP_DEBUG) {
			console.warn(message, ...args)
		}
	},
	error: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && process.env?.XMTP_DEBUG) {
			console.error(message, ...args)
		}
	}
}
