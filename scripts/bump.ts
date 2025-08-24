#!/usr/bin/env tsx

import { readFileSync, readdirSync, statSync, writeFileSync } from "fs"
import { join } from "path"

interface PackageJson {
	name: string
	version: string
	[key: string]: any
}

function bumpVersion(
	version: string,
	type: "patch" | "minor" | "major"
): string {
	const [major, minor, patch] = version.split(".").map(Number)

	switch (type) {
		case "major":
			return `${major + 1}.0.0`
		case "minor":
			return `${major}.${minor + 1}.0`
		case "patch":
			return `${major}.${minor}.${patch + 1}`
		default:
			throw new Error(`Unknown bump type: ${type}`)
	}
}

function bumpPackageVersions(bumpType: "patch" | "minor" | "major" = "patch") {
	try {
		// Find all package directories in the packages directory
		const packagesDir = join(process.cwd(), "packages")
		const packageDirs = readdirSync(packagesDir).filter((item) => {
			const itemPath = join(packagesDir, item)
			return statSync(itemPath).isDirectory()
		})

		const packageFiles = packageDirs.map(
			(dir) => `packages/${dir}/package.json`
		)

		console.log(`🔍 Found ${packageFiles.length} packages to bump`)
		console.log(`📦 Bumping ${bumpType} versions...\n`)

		for (const packageFile of packageFiles) {
			const packagePath = join(process.cwd(), packageFile)
			const packageJson: PackageJson = JSON.parse(
				readFileSync(packagePath, "utf-8")
			)

			const currentVersion = packageJson.version
			const newVersion = bumpVersion(currentVersion, bumpType)

			// Update the version in the package.json
			packageJson.version = newVersion

			// Write the updated package.json back
			writeFileSync(packagePath, JSON.stringify(packageJson, null, "\t") + "\n")

			console.log(`✅ ${packageJson.name}: ${currentVersion} → ${newVersion}`)
		}

		console.log(
			`\n🎉 Successfully bumped all packages to ${bumpType} versions!`
		)
	} catch (error) {
		console.error("❌ Error bumping package versions:", error)
		process.exit(1)
	}
}

// Parse command line arguments
const bumpType = (process.argv[2] as "patch" | "minor" | "major") || "patch"

if (!["patch", "minor", "major"].includes(bumpType)) {
	console.error("❌ Invalid bump type. Please use: patch, minor, or major")
	process.exit(1)
}

// Run the bump script
bumpPackageVersions(bumpType)
