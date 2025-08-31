#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises"
import { dirname, extname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function fixImports(dir) {
	const files = await readdir(dir, { withFileTypes: true })

	for (const file of files) {
		const filePath = join(dir, file.name)

		if (file.isDirectory()) {
			await fixImports(filePath)
		} else if (file.isFile() && file.name.endsWith(".js")) {
			let content = await readFile(filePath, "utf-8")
			let modified = false

			// Fix relative imports that don't have .js extension
			content = content.replace(
				/from\s+["'](\.[^"']*)["']/g,
				(match, importPath) => {
					// Don't add .js if it already has an extension
					if (extname(importPath)) {
						return match
					}
					// Don't add .js to paths that start with ./ or ../ and don't have extension
					if (importPath.startsWith("./") || importPath.startsWith("../")) {
						modified = true
						return `from "${importPath}.js"`
					}
					return match
				}
			)

			if (modified) {
				await writeFile(filePath, content, "utf-8")
				console.log(`Fixed imports in: ${filePath}`)
			}
		}
	}
}

async function main() {
	const distDir = join(__dirname, "..", "dist")
	console.log("Fixing ES module imports in dist directory...")
	await fixImports(distDir)
	console.log("Import fixes completed.")
}

main().catch(console.error)

