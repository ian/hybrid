import { remark } from "remark"
import strip from "strip-markdown"

/**
 * Strips markdown from a string
 * @param markdown - The markdown string to strip
 * @returns The stripped markdown string
 */
export async function stripMarkdown(markdown: string) {
	const file = await remark().use(strip).process(markdown)
	return String(file)
}
