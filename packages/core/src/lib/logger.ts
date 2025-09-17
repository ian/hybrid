/**
 * Global logger instance for conditional debug logging
 * Supports both DEBUG and XMTP_DEBUG environment variables for backward compatibility
 * Compatible with common logger interfaces
 */
export const logger = {
	debug: (...args: any[]): void => {
		if (typeof process !== 'undefined' && (process.env?.DEBUG || process.env?.XMTP_DEBUG)) {
			console.log(...args)
		}
	},
	log: (...args: any[]): void => {
		if (typeof process !== 'undefined' && (process.env?.DEBUG || process.env?.XMTP_DEBUG)) {
			console.log(...args)
		}
	},
	info: (...args: any[]): void => {
		if (typeof process !== 'undefined' && (process.env?.DEBUG || process.env?.XMTP_DEBUG)) {
			console.info(...args)
		}
	},
	warn: (...args: any[]): void => {
		if (typeof process !== 'undefined' && (process.env?.DEBUG || process.env?.XMTP_DEBUG)) {
			console.warn(...args)
		}
	},
	error: (...args: any[]): void => {
		if (typeof process !== 'undefined' && (process.env?.DEBUG || process.env?.XMTP_DEBUG)) {
			console.error(...args)
		}
	}
}
