#!/usr/bin/env node

import degit from "degit"
import dotenv from "dotenv"
import { spawn } from "node:child_process"
import { getRandomValues } from "node:crypto"
import { existsSync } from "node:fs"
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { createInterface } from "node:readline"
import { fileURLToPath } from "node:url"
import { toString as uint8ToString } from "uint8arrays"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Check Node.js version
const nodeVersion = process.versions.node
const [major] = nodeVersion.split(".").map(Number)
if (!major || major < 20) {
	console.error("Error: Node.js version 20 or higher is required")
	process.exit(1)
}

// Generate a random encryption key
function generateEncryptionKeyHex() {
	const uint8Array = getRandomValues(new Uint8Array(32))
	return uint8ToString(uint8Array, "hex")
}

// Generate keys and display them for manual addition to .env
async function generateKeys() {
	console.log("🔑 Generating XMTP keys...")

	const walletKey = generatePrivateKey()
	const account = privateKeyToAccount(walletKey)
	const encryptionKeyHex = generateEncryptionKeyHex()
	const publicKey = account.address

	console.log("\n✅ Keys generated successfully!")
	console.log("\n📋 Add these environment variables to your .env file:")
	console.log("=".repeat(60))
	console.log(`WALLET_KEY=${walletKey}`)
	console.log(`ENCRYPTION_KEY=${encryptionKeyHex}`)
	console.log(`XMTP_ENV=dev  # or 'production' for mainnet`)
	console.log("=".repeat(60))
	console.log(`\n🔍 Your public key (wallet address): ${publicKey}`)
	console.log("\n📝 Instructions:")
	console.log("1. Copy the environment variables above")
	console.log("2. Paste them into your .env file")
	console.log(
		"3. Set XMTP_ENV to 'dev' for development or 'production' for mainnet"
	)
	console.log("4. Add your OPENROUTER_API_KEY if you haven't already")
	console.log(
		"\n⚠️  Keep these keys secure and never commit them to version control!"
	)
}

// Prompt user for input
function prompt(question: string): Promise<string> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout
	})

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close()
			resolve(answer)
		})
	})
}

// Template variable substitution
function replaceTemplateVariables(
	content: string,
	variables: Record<string, string>
): string {
	return content.replace(
		/\{\{(\w+)\}\}/g,
		(match, key) => variables[key] || match
	)
}

// Copy template file with variable substitution
async function copyTemplate(
	templatePath: string,
	destPath: string,
	variables: Record<string, string> = {}
) {
	try {
		let content = await readFile(templatePath, "utf-8")

		// Replace template variables
		if (Object.keys(variables).length > 0) {
			content = replaceTemplateVariables(content, variables)
		}

		await writeFile(destPath, content, "utf-8")
		console.log(`✅ Created ${destPath.split("/").pop()}`)
	} catch (error) {
		console.error(`❌ Failed to create ${destPath.split("/").pop()}:`, error)
		process.exit(1)
	}
}

// Initialize a new hybrid project
async function initializeProject() {
	console.log("🚀 Creating a new Hybrid project...")

	// Get project name
	const projectNameArg = process.argv[3] // Allow passing name as argument
	let projectName = projectNameArg

	if (!projectName) {
		while (!projectName || !projectName.trim()) {
			projectName = await prompt("Enter project name: ")
			if (!projectName || !projectName.trim()) {
				console.log("❌ Project name is required. Please enter a valid name.")
			}
		}
	}

	// Sanitize project name for package.json and directory
	const sanitizedName = projectName
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, "-") // Replace invalid chars with dashes
		.replace(/-+/g, "-") // Collapse multiple dashes
		.replace(/^-|-$/g, "") // Remove leading/trailing dashes

	// Create project directory
	const currentDir = process.cwd()
	const projectDir =
		projectName === "." ? currentDir : join(currentDir, sanitizedName)

	// Check if directory already exists and is not empty
	if (projectName !== ".") {
		try {
			const existingFiles = await readdir(projectDir)
			if (existingFiles.length > 0) {
				console.log(
					`❌ Directory "${sanitizedName}" already exists and is not empty`
				)
				console.log(
					"Please choose a different name or remove the existing directory"
				)
				process.exit(1)
			}
		} catch {
			// Directory doesn't exist, which is fine
		}
	}

	// Use degit to clone template from GitHub, with fallback to local templates
	console.log("📦 Downloading template from GitHub...")
	let templateDownloaded = false

	try {
		// Parse REPO environment variable to support repository and branch specification
		const repoEnv = process.env.REPO || "ian/hybrid"
		let templateRepo: string

		if (repoEnv.includes("#")) {
			// Format: user/repo#branch
			const [repo, branch] = repoEnv.split("#")
			templateRepo = `${repo}/templates/agent#${branch}`
			console.log(`🔗 Using repository: ${repo} (branch: ${branch})`)
		} else {
			// Format: user/repo (use default branch)
			templateRepo = `${repoEnv}/templates/agent`
			console.log(`🔗 Using repository: ${repoEnv} (default branch)`)
		}

		const emitter = degit(templateRepo, {
			cache: false,
			force: true,
			verbose: false
		})
		await emitter.clone(projectDir)
		console.log(`✅ Template downloaded from GitHub to: ${sanitizedName}`)
		templateDownloaded = true
	} catch (error) {
		console.log(
			"⚠️  Failed to download template from GitHub, trying local fallback..."
		)

		// Fallback to local templates if they exist
		// Try development path first, then bundled templates
		let localTemplatesDir = join(__dirname, "../../../../templates/agent")

		try {
			// Check if development templates exist
			await readFile(join(localTemplatesDir, "package.json"), "utf-8")
		} catch {
			// Fall back to bundled templates in CI/production
			localTemplatesDir = join(__dirname, "../templates")
		}

		try {
			const templateFiles = [
				{ src: "package.json", dest: "package.json" },
				{ src: "tsconfig.json", dest: "tsconfig.json" },
				{ src: "README.md", dest: "README.md" },
				{ src: "vitest.config.ts", dest: "vitest.config.ts" },
				{ src: ".gitignore", dest: ".gitignore" },
				{ src: ".env", dest: ".env" }
			]

			// Create src directory
			const srcDir = join(projectDir, "src")
			await mkdir(srcDir, { recursive: true })
			console.log("✅ Created src directory")

			// Copy main template files
			await Promise.all(
				templateFiles.map(async ({ src, dest }) => {
					const templatePath = join(localTemplatesDir, src)
					const destPath = join(projectDir, dest)
					await copyTemplate(templatePath, destPath, {
						projectName: sanitizedName
					})
				})
			)

			// Copy agent.ts to src directory
			const agentTemplatePath = join(localTemplatesDir, "src/agent.ts")
			const agentDestPath = join(srcDir, "agent.ts")
			await copyTemplate(agentTemplatePath, agentDestPath, {
				projectName: sanitizedName
			})

			// Copy test file
			const testTemplatePath = join(localTemplatesDir, "src/agent.test.ts")
			const testDestPath = join(srcDir, "agent.test.ts")
			await copyTemplate(testTemplatePath, testDestPath, {
				projectName: sanitizedName
			})

			console.log(`✅ Template copied from local files to: ${sanitizedName}`)
			templateDownloaded = true
		} catch (localError) {
			console.error("❌ Failed to use local template fallback:", localError)
			console.log(
				"💡 Make sure you have internet connection or the local templates exist"
			)
			process.exit(1)
		}
	}

	if (!templateDownloaded) {
		console.error("❌ Could not download or copy template")
		process.exit(1)
	}

	// Replace template variables in all files
	const variables = {
		projectName: sanitizedName
	}

	try {
		// Read and update files with template variables
		const filesToUpdate = [
			join(projectDir, "package.json"),
			join(projectDir, "README.md")
		]

		for (const filePath of filesToUpdate) {
			try {
				let content = await readFile(filePath, "utf-8")
				content = replaceTemplateVariables(content, variables)
				await writeFile(filePath, content, "utf-8")
			} catch (error) {
				// File might not exist, continue
				console.log(
					`⚠️  Could not update ${filePath.split("/").pop()}: file not found`
				)
			}
		}

		console.log("✅ Template variables updated")
	} catch (error) {
		console.error("❌ Failed to update template variables:", error)
	}

	console.log("\n🎉 Hybrid project created successfully!")
	console.log(`\n📂 Project created in: ${projectDir}`)
	console.log("\n📋 Next steps:")
	console.log(`1. cd ${sanitizedName}`)
	console.log(
		"2. Install dependencies (npm install, yarn install, or pnpm install)"
	)
	console.log("3. Get your OpenRouter API key from https://openrouter.ai/keys")
	console.log("4. Add your API key to the OPENROUTER_API_KEY in .env")
	console.log("5. Set XMTP_ENV in .env (dev or production)")
	console.log("6. Generate keys: npm run keys (or yarn/pnpm equivalent)")
	console.log("7. Start development: npm run dev (or yarn/pnpm equivalent)")

	console.log(
		"\n📖 For more information, see the README.md file in your project"
	)
}

// Run development server
function runDev() {
	console.log("Starting development server...")

	// Load environment variables from .env file
	const envPath = join(process.cwd(), ".env")
	if (existsSync(envPath)) {
		dotenv.config({ path: envPath })
		console.log("✅ Loaded environment variables from .env")
	} else {
		console.log("⚠️  No .env file found - environment variables not loaded")
	}

	const child = spawn("tsx", ["--watch", "src/agent.ts"], {
		stdio: "inherit",
		shell: true
	})

	child.on("error", (error) => {
		console.error("Failed to start dev server:", error)
		process.exit(1)
	})

	child.on("exit", (code) => {
		process.exit(code ?? 0)
	})
}

// Build the project
function runBuild() {
	console.log("Building project...")
	const child = spawn("tsc", [], {
		stdio: "inherit",
		shell: true
	})

	child.on("error", (error) => {
		console.error("Failed to build project:", error)
		process.exit(1)
	})

	child.on("exit", (code) => {
		if (code === 0) {
			console.log("Build completed successfully")
		} else {
			console.error("Build failed")
			process.exit(code ?? 1)
		}
	})
}

// Main CLI logic
async function main() {
	const command = process.argv[2]

	switch (command) {
		case "init":
			try {
				await initializeProject()
			} catch (error) {
				console.error("Failed to initialize project:", error)
				process.exit(1)
			}
			break
		case "dev":
			runDev()
			break
		case "gen:keys":
			try {
				await generateKeys()
			} catch (error) {
				console.error("Failed to generate keys:", error)
				process.exit(1)
			}
			break
		case "build":
			runBuild()
			break
		case "--help":
		case "-h":
		case "help":
		default:
			console.log("Usage: hybrid <command> or hy <command>")
			console.log("")
			console.log("Commands:")
			console.log("  init [name]  Create a new Hybrid project")
			console.log("  dev          Start development server with watch mode")
			console.log("  build        Build the TypeScript project")
			console.log("  gen:keys     Generate XMTP wallet and encryption keys")
			console.log("")
			console.log("Environment Variables:")
			console.log(
				"  REPO         Set template repository (default: ian/hybrid)"
			)
			console.log("               Format: user/repo or user/repo#branch")
			console.log("")
			console.log("Examples:")
			console.log("  hybrid init my-agent    or    hy init my-agent")
			console.log(
				"  hybrid init             or    hy init (will prompt for name)"
			)
			console.log("  hybrid dev              or    hy dev")
			console.log("  hybrid build            or    hy build")
			console.log("  hybrid gen:keys         or    hy gen:keys")
			console.log("")
			console.log("  REPO=myuser/myrepo hybrid init my-agent")
			console.log("  REPO=myuser/myrepo#dev hybrid init my-agent")
			// Only exit with error code for unknown commands, not for help
			if (command && !["--help", "-h", "help"].includes(command)) {
				process.exit(1)
			}
	}
}

// Run the CLI
main().catch((error) => {
	console.error("CLI error:", error)
	process.exit(1)
})
