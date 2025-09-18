/**
 * Global logger instance for conditional debug logging
 * Supports both DEBUG and XMTP_DEBUG environment variables for backward compatibility
 * Compatible with common logger interfaces
 */
export const logger = {
	debug: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && (process.env?.DEBUG || process.env?.XMTP_DEBUG)) {
			console.log(message, ...args)
		}
	},
	log: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && (process.env?.DEBUG || process.env?.XMTP_DEBUG)) {
			console.log(message, ...args)
		}
	},
	info: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && (process.env?.DEBUG || process.env?.XMTP_DEBUG)) {
			console.info(message, ...args)
		}
	},
	warn: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && (process.env?.DEBUG || process.env?.XMTP_DEBUG)) {
			console.warn(message, ...args)
		}
	},
	error: (message: string, ...args: any[]): void => {
		if (typeof process !== 'undefined' && (process.env?.DEBUG || process.env?.XMTP_DEBUG)) {
			console.error(message, ...args)
		}
	}
}
