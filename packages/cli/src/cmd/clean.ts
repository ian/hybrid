import { existsSync } from "node:fs"
import { join } from "node:path"
import { rimraf } from "rimraf"

// Clean the project (remove dist directory)
export async function runClean() {
	console.log("🧹 Cleaning project...")

	const cwd = process.cwd()
	const distPath = join(cwd, "dist")

	try {
		// Remove dist directory
		if (existsSync(distPath)) {
			console.log("Removing dist directory...")
			await rimraf(distPath)
			console.log("✅ Removed dist directory")
		} else {
			console.log("⚠️  dist directory not found, skipping...")
		}

		console.log("🎉 Project cleaned successfully!")
	} catch (error) {
		console.error("❌ Failed to clean project:", error)
		process.exit(1)
	}
}
