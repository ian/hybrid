/**
 * Truncates a given string to a specified length, adding an ellipsis if the
 * string is longer than the specified length.
 *
 * @param {string} str - The string to truncate.
 * @param {number} length - The maximum length of the resulting string.
 *
 * @returns {string} The truncated string.
 */
export function truncate(str: string, length: number) {
	return str.length > length ? `${str.slice(0, length)}...` : str
}
