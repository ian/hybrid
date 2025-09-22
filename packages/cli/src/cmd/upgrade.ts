import { spawn } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"

interface PackageManager {
	name: string
	lockFile: string
	installCmd: string[]
	upgradeCmd: string[]
}

const packageManagers: PackageManager[] = [
	{
		name: "pnpm",
		lockFile: "pnpm-lock.yaml",
		installCmd: ["pnpm", "install"],
		upgradeCmd: ["pnpm", "update"]
	},
	{
		name: "yarn",
		lockFile: "yarn.lock",
		installCmd: ["yarn", "install"],
		upgradeCmd: ["yarn", "upgrade"]
	},
	{
		name: "bun",
		lockFile: "bun.lockb",
		installCmd: ["bun", "install"],
		upgradeCmd: ["bun", "update"]
	},
	{
		name: "npm",
		lockFile: "package-lock.json",
		installCmd: ["npm", "install"],
		upgradeCmd: ["npm", "update"]
	}
]

function detectPackageManager(
	startDir: string = process.cwd()
): PackageManager {
	let currentDir = resolve(startDir)

	// First, search up for workspace/project root indicators
	let projectRoot = resolve(startDir)
	let foundWorkspaceRoot = false
	while (true) {
		// Strong indicators of workspace/project root (these are definitive)
		const isWorkspaceRoot =
			existsSync(join(currentDir, "pnpm-workspace.yaml")) ||
			existsSync(join(currentDir, "turbo.json"))

		if (isWorkspaceRoot) {
			projectRoot = currentDir
			foundWorkspaceRoot = true
			break
		}

		// Check if this directory looks like a system directory (stop here)
		const isSystemDir = [
			"/usr",
			"/etc",
			"/var",
			"/opt",
			"/bin",
			"/sbin",
			"/lib",
			"/lib64"
		].some(
			(systemPath) =>
				currentDir.startsWith(`${systemPath}/`) || currentDir === systemPath
		)

		// Stop if we've gone too far up the directory tree
		if (isSystemDir) {
			break
		}

		// Move up one directory
		const parentDir = join(currentDir, "..")
		if (parentDir === currentDir) {
			// We've reached the filesystem root
			break
		}
		currentDir = parentDir
	}

	// If we didn't find a workspace root, continue searching up the directory tree
	if (!foundWorkspaceRoot) {
		let currentSearchDir = join(projectRoot, "..")
		while (currentSearchDir !== projectRoot) {
			if (
				existsSync(join(currentSearchDir, "pnpm-workspace.yaml")) ||
				existsSync(join(currentSearchDir, "turbo.json"))
			) {
				projectRoot = currentSearchDir
				foundWorkspaceRoot = true
				break
			}

			// Check if we've reached a system directory (stop here)
			const isSystemDir = [
				"/usr",
				"/etc",
				"/var",
				"/opt",
				"/bin",
				"/sbin",
				"/lib",
				"/lib64"
			].some(
				(systemPath) =>
					currentSearchDir.startsWith(`${systemPath}/`) ||
					currentSearchDir === systemPath
			)
			if (isSystemDir) {
				break
			}

			const nextDir = join(currentSearchDir, "..")
			if (nextDir === currentSearchDir) {
				// Reached filesystem root
				break
			}
			currentSearchDir = nextDir
		}
	}

	// Now look for lock files in the identified project root
	for (const pm of packageManagers) {
		if (existsSync(join(projectRoot, pm.lockFile))) {
			return pm
		}
	}

	// Default to npm if no lock file is found in the project root
	const npmPm = packageManagers.find((pm) => pm.name === "npm")
	if (!npmPm) {
		throw new Error("Could not find npm package manager configuration")
	}
	return npmPm
}

function findPackageJsonFiles(cwd: string = process.cwd()): string[] {
	const packageJsonFiles: string[] = []

	function searchDirectory(dir: string): void {
		try {
			const items = readdirSync(dir, { withFileTypes: true })

			for (const item of items) {
				const fullPath = join(dir, item.name)

				if (
					item.isDirectory() &&
					!item.name.startsWith(".") &&
					item.name !== "node_modules"
				) {
					searchDirectory(fullPath)
				} else if (item.isFile() && item.name === "package.json") {
					packageJsonFiles.push(fullPath)
				}
			}
		} catch (error) {
			// Skip directories we can't read (permission issues, etc.)
			console.warn(`⚠️  Could not read directory ${dir}:`, error)
		}
	}

	searchDirectory(cwd)
	return packageJsonFiles
}

function findHybridPackages(packageJsonPaths: string[]): Set<string> {
	const hybridPackages = new Set<string>()

	for (const packageJsonPath of packageJsonPaths) {
		try {
			const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
			const allDeps = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
				...packageJson.peerDependencies,
				...packageJson.optionalDependencies
			}

			for (const [packageName] of Object.entries(allDeps)) {
				if (packageName === "hybrid" || packageName.startsWith("@hybrd/")) {
					hybridPackages.add(packageName)
				}
			}
		} catch (error) {
			console.warn(`⚠️  Failed to parse ${packageJsonPath}:`, error)
		}
	}

	return hybridPackages
}

function runCommand(cmd: string[], cwd: string = process.cwd()): Promise<void> {
	return new Promise((resolve, reject) => {
		console.log(`🔄 Running: ${cmd.join(" ")}`)

		const child = spawn(cmd[0], cmd.slice(1), {
			cwd,
			stdio: "inherit",
			shell: true
		})

		child.on("error", (error) => {
			console.error(`❌ Command failed: ${cmd.join(" ")}`)
			reject(error)
		})

		child.on("exit", (code) => {
			if (code === 0) {
				console.log(`✅ Command completed: ${cmd.join(" ")}`)
				resolve()
			} else {
				console.error(
					`❌ Command failed with exit code ${code}: ${cmd.join(" ")}`
				)
				reject(new Error(`Command exited with code ${code}`))
			}
		})
	})
}

export async function runUpgrade(): Promise<void> {
	const cwd = process.cwd()

	console.log("🔍 Detecting package manager...")
	const packageManager = detectPackageManager(cwd)
	console.log(`📦 Using ${packageManager.name} as package manager`)

	console.log("🔍 Finding package.json files...")
	const packageJsonFiles = findPackageJsonFiles(cwd)
	console.log(`📄 Found ${packageJsonFiles.length} package.json files`)

	console.log("🔍 Finding hybrid packages...")
	const hybridPackages = findHybridPackages(packageJsonFiles)
	const packagesList = Array.from(hybridPackages)

	if (packagesList.length === 0) {
		console.log("ℹ️  No hybrid packages found to upgrade")
		return
	}

	console.log(`📦 Found ${packagesList.length} hybrid packages:`)
	for (const pkg of packagesList) {
		console.log(`   - ${pkg}`)
	}

	console.log("\n⬆️  Upgrading packages...")

	try {
		// For pnpm, yarn, and bun, we can upgrade specific packages
		if (packageManager.name === "pnpm") {
			await runCommand(["pnpm", "update", ...packagesList], cwd)
		} else if (packageManager.name === "yarn") {
			await runCommand(["yarn", "upgrade", ...packagesList], cwd)
		} else if (packageManager.name === "bun") {
			await runCommand(["bun", "update", ...packagesList], cwd)
		} else {
			// For npm, we need to upgrade all packages since npm update doesn't take package names
			await runCommand(["npm", "update"], cwd)
		}

		console.log("\n🎉 Hybrid packages upgraded successfully!")
		console.log(
			"ℹ️  You may need to restart your development server for changes to take effect."
		)
	} catch (error) {
		console.error("❌ Failed to upgrade packages:", error)
		process.exit(1)
	}
}
