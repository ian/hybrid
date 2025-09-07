import { existsSync } from "node:fs"
import { join } from "node:path"
import { rimraf } from "rimraf"

// Clean the project (remove dist and node_modules)
export async function runClean() {
	console.log("🧹 Cleaning project...")

	const cwd = process.cwd()
	const distPath = join(cwd, "dist")
	const nodeModulesPath = join(cwd, "node_modules")

	try {
		// Remove dist directory
		if (existsSync(distPath)) {
			console.log("Removing dist directory...")
			await rimraf(distPath)
			console.log("✅ Removed dist directory")
		} else {
			console.log("⚠️  dist directory not found, skipping...")
		}

		// Remove node_modules directory
		if (existsSync(nodeModulesPath)) {
			console.log("Removing node_modules directory...")
			await rimraf(nodeModulesPath)
			console.log("✅ Removed node_modules directory")
		} else {
			console.log("⚠️  node_modules directory not found, skipping...")
		}

		console.log("🎉 Project cleaned successfully!")
	} catch (error) {
		console.error("❌ Failed to clean project:", error)
		process.exit(1)
	}
}
