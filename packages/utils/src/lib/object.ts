/**
 * Stringifies all values in an object, including objects and null values.
 * If obj is undefined, returns an empty object.
 * @param obj - The object to stringify
 * @returns A new object with the same keys as obj, but with all values stringified
 */
export function stringifyValues(
	obj: Record<string, unknown> | undefined
): Record<string, string> {
	const result: Record<string, string> = {}

	if (!obj) {
		return {}
	}

	for (const key in obj) {
		const value = obj[key]
		result[key] =
			value === null
				? "null"
				: typeof value === "object"
					? JSON.stringify(value)
					: String(value)
	}

	return result
}

/**
 * Removes empty values (undefined, null, empty strings) from an object
 *
 * @param obj - The object to prune
 * @returns A new object with empty values removed
 */
export function pruneEmpty<T extends Record<string, unknown>>(
	obj: T | undefined
): Partial<T> {
	if (!obj) {
		return {}
	}

	return Object.entries(obj).reduce(
		(acc, [key, value]) => {
			// Skip undefined, null, and empty strings
			if (value === undefined || value === null || value === "") {
				return acc
			}
			// Avoid spread syntax on accumulator
			acc[key as keyof T] = value as any
			return acc
		},
		{} as Partial<T>
	)
}
