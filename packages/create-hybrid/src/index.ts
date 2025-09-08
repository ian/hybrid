import { Command } from "commander"
import degit from "degit"
import { readFile, readdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import prompts from "prompts"

interface Example {
	name: string
	description: string
	path: string
}

// Default to main branch, but allow override via REPO env var for CI/testing
const DEFAULT_REPO = "ian/hybrid"
const REPO = process.env.REPO || DEFAULT_REPO

const EXAMPLES: Example[] = [
	{
		name: "basic",
		description: "Basic XMTP agent with message filtering and AI responses",
		path: "basic" // Path is now handled separately in degit options
	},
	{
		name: "crypto-agent",
		description: "Advanced agent with blockchain integration and crypto tools",
		path: "crypto-agent" // Path is now handled separately in degit options
	}
]

function isInMonorepo(): boolean {
	// Check if we're running from within the monorepo (for development/testing)
	const currentDir = process.cwd()
	const packageJsonPath = join(currentDir, "package.json")
	try {
		const packageJson = require(packageJsonPath)
		return (
			packageJson.name === "hybrid" || currentDir.includes("/hybrid/packages/")
		)
	} catch {
		return false
	}
}

function replaceTemplateVariables(
	content: string,
	variables: Record<string, string>
): string {
	return content.replace(
		/\{\{(\w+)\}\}/g,
		(match, key) => variables[key] || match
	)
}

async function updateTemplateFiles(
	projectDir: string,
	projectName: string
): Promise<void> {
	const variables = { projectName }

	const filesToUpdate = [
		join(projectDir, "package.json"),
		join(projectDir, "README.md"),
		join(projectDir, "src", "agent.ts")
	]

	for (const filePath of filesToUpdate) {
		try {
			let content = await readFile(filePath, "utf-8")

			// First try template variable replacement
			content = replaceTemplateVariables(content, variables)

			// Special handling for package.json if template variables weren't found
			if (filePath.endsWith("package.json")) {
				try {
					const packageJson = JSON.parse(content)
					let updated = false

					// If name is still a generic name, replace it
					if (
						packageJson.name === "agent" ||
						packageJson.name === "hybrid-example-basic-agent"
					) {
						packageJson.name = projectName
						updated = true
					}

					// Ensure required scripts exist
					if (!packageJson.scripts) {
						packageJson.scripts = {}
					}

					// Add missing scripts and update old scripts to use hybrid CLI
					const requiredScripts = {
						clean: "hybrid clean",
						dev: "hybrid dev",
						build: "hybrid build",
						start: "hybrid start",
						keys: "hybrid gen:keys --write",
						test: "vitest",
						"test:watch": "vitest --watch",
						"test:coverage": "vitest --coverage",
						lint: "biome lint --write",
						"lint:check": "biome lint",
						format: "biome format --write",
						"format:check": "biome format --check",
						typecheck: "tsc --noEmit"
					}

					for (const [scriptName, scriptCommand] of Object.entries(
						requiredScripts
					)) {
						// Always update scripts to use the correct hybrid CLI commands
						packageJson.scripts[scriptName] = scriptCommand
						updated = true
					}

					// Update dependencies to use independent packages
					if (packageJson.dependencies) {
						if (packageJson.dependencies.hybrid === "workspace:*") {
							packageJson.dependencies.hybrid = "latest"
							updated = true
						}
						if (
							packageJson.dependencies["@openrouter/ai-sdk-provider"] ===
							"catalog:ai"
						) {
							packageJson.dependencies["@openrouter/ai-sdk-provider"] = "^1.1.2"
							updated = true
						}
						if (packageJson.dependencies.zod === "catalog:stack") {
							packageJson.dependencies.zod = "^3.23.8"
							updated = true
						}
						// Remove workspace dependencies
						if (packageJson.dependencies["@hybrd/xmtp"]) {
							packageJson.dependencies["@hybrd/xmtp"] = undefined
							updated = true
						}
					}

					// Update devDependencies to use independent packages
					if (packageJson.devDependencies) {
						const independentDevDeps = {
							"@biomejs/biome": "^1.9.4",
							"@types/node": "^22.0.0",
							"@hybrd/cli": "latest",
							tsx: "^4.20.5",
							typescript: "^5.8.3",
							vitest: "^3.2.4"
						}

						// Remove workspace dependencies
						packageJson.devDependencies["@config/biome"] = undefined
						packageJson.devDependencies["@config/tsconfig"] = undefined

						// Add independent dependencies
						for (const [depName, depVersion] of Object.entries(
							independentDevDeps
						)) {
							packageJson.devDependencies[depName] = depVersion
						}
						updated = true
					}

					if (updated) {
						content = `${JSON.stringify(packageJson, null, "\t")}\n`
					}
				} catch (parseError) {
					console.log("⚠️  Could not parse package.json for name update")
				}
			}

			// Special handling for README.md if template variables weren't found
			if (filePath.endsWith("README.md")) {
				// Replace common README title patterns with project name
				content = content.replace(/^# .*$/m, `# ${projectName}`)
			}

			await writeFile(filePath, content, "utf-8")
		} catch (error) {
			console.log(
				`⚠️  Could not update ${filePath.split("/").pop()}: file not found or error occurred`
			)
		}
	}

	// Ensure .env file exists - create it if missing
	const envPath = join(projectDir, ".env")
	try {
		await readFile(envPath, "utf-8")
	} catch {
		// .env file doesn't exist, create it
		const envContent = `# Required
OPENROUTER_API_KEY=your_openrouter_api_key_here
XMTP_WALLET_KEY=your_wallet_key_here
XMTP_ENCRYPTION_KEY=your_encryption_key_here

# Optional
XMTP_ENV=dev
PORT=8454`
		await writeFile(envPath, envContent, "utf-8")
		console.log("📄 Created .env template file")
	}

	// Ensure vitest.config.ts exists - create it if missing
	const vitestConfigPath = join(projectDir, "vitest.config.ts")
	try {
		await readFile(vitestConfigPath, "utf-8")
	} catch {
		// vitest.config.ts doesn't exist, create it
		const vitestConfigContent = `import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		setupFiles: []
	},
	resolve: {
		alias: {
			"@": "./src"
		}
	}
})`
		await writeFile(vitestConfigPath, vitestConfigContent, "utf-8")
		console.log("📄 Created vitest.config.ts file")
	}

	// Ensure src/agent.test.ts exists - create it if missing
	const agentTestPath = join(projectDir, "src", "agent.test.ts")
	try {
		await readFile(agentTestPath, "utf-8")
	} catch {
		// agent.test.ts doesn't exist, create it
		const agentTestContent = `import { describe, expect, it } from "vitest"

// Example test file - replace with actual tests for your agent

describe("Agent", () => {
	it("should be defined", () => {
		// This is a placeholder test
		// Add real tests for your agent functionality
		expect(true).toBe(true)
	})
})`
		await writeFile(agentTestPath, agentTestContent, "utf-8")
		console.log("📄 Created src/agent.test.ts file")
	}
}

async function checkDirectoryEmpty(dirPath: string): Promise<boolean> {
	try {
		const files = await readdir(dirPath)
		const significantFiles = files.filter(
			(file) =>
				!file.startsWith(".") &&
				file !== "node_modules" &&
				file !== "package-lock.json" &&
				file !== "yarn.lock" &&
				file !== "pnpm-lock.yaml"
		)
		return significantFiles.length === 0
	} catch {
		// Directory doesn't exist, so it's "empty"
		return true
	}
}

async function createProject(
	projectName: string,
	exampleName?: string
): Promise<void> {
	console.log("🚀 Creating a new Hybrid project...")

	// Validate project name
	if (!projectName || projectName.trim() === "") {
		console.error("❌ Project name is required")
		process.exit(1)
	}

	const sanitizedName = projectName
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")

	const currentDir = process.cwd()
	const projectDir =
		projectName === "." ? currentDir : join(currentDir, sanitizedName)

	// Check if directory is empty
	const isEmpty = await checkDirectoryEmpty(projectDir)
	if (!isEmpty) {
		console.error(
			`❌ Directory "${sanitizedName}" already exists and is not empty`
		)
		console.error(
			"Please choose a different name or remove the existing directory"
		)
		process.exit(1)
	}

	// Select example if not provided
	let selectedExample: Example
	if (exampleName) {
		const example = EXAMPLES.find((ex) => ex.name === exampleName)
		if (!example) {
			console.error(`❌ Example "${exampleName}" not found`)
			console.error(
				`Available examples: ${EXAMPLES.map((ex) => ex.name).join(", ")}`
			)
			process.exit(1)
		}
		selectedExample = example
		console.log(`📋 Using example: ${selectedExample.name}`)
	} else {
		// Check if we're running in a non-interactive environment (like CI)
		if (!process.stdin.isTTY) {
			console.error(
				"❌ Example is required in non-interactive mode. Use --example <name>"
			)
			console.error(
				`Available examples: ${EXAMPLES.map((ex) => ex.name).join(", ")}`
			)
			process.exit(1)
		}

		const { example } = await prompts({
			type: "select",
			name: "example",
			message: "Which example would you like to use?",
			choices: EXAMPLES.map((ex) => ({
				title: ex.name,
				description: ex.description,
				value: ex
			})),
			initial: 0
		})

		if (!example) {
			console.log("❌ No example selected. Exiting...")
			process.exit(1)
		}

		selectedExample = example
	}

	console.log(`📦 Cloning ${selectedExample.name} example...`)

	try {
		// For degit, the correct syntax is: repo#branch/subdirectory
		// But we need to be careful about the path construction
		let degitSource: string

		if (REPO.includes("#")) {
			// REPO is in format "user/repo#branch"
			// We need to construct: user/repo#branch/examples/basic
			const [repoWithBranch] = REPO.split("/examples/") // Remove any existing path
			degitSource = `${repoWithBranch}/examples/${selectedExample.name}`
		} else {
			// No branch specified, use default format
			degitSource = `${REPO}/examples/${selectedExample.name}`
		}

		console.log(`🔍 Degit source: ${degitSource}`)
		const emitter = degit(degitSource)
		await emitter.clone(projectDir)
		console.log(`✅ Template cloned to: ${sanitizedName}`)
	} catch (error) {
		console.error("❌ Failed to clone template:", error)
		process.exit(1)
	}

	// Update template variables
	console.log("🔧 Updating template variables...")
	try {
		await updateTemplateFiles(projectDir, sanitizedName)
		console.log("✅ Template variables updated")
	} catch (error) {
		console.error("❌ Failed to update template variables:", error)
	}

	console.log("\n🎉 Hybrid project created successfully!")
	console.log(`\n📂 Project created in: ${projectDir}`)
	console.log("\n📋 Next steps:")
	if (projectName !== ".") {
		console.log(`1. cd ${sanitizedName}`)
	}
	console.log(
		`${projectName !== "." ? "2" : "1"}. Install dependencies (npm install, yarn install, or pnpm install)`
	)
	console.log(
		`${projectName !== "." ? "3" : "2"}. Get your OpenRouter API key from https://openrouter.ai/keys`
	)
	console.log(
		`${projectName !== "." ? "4" : "3"}. Add your API key to the OPENROUTER_API_KEY in .env`
	)
	console.log(
		`${projectName !== "." ? "5" : "4"}. Set XMTP_ENV in .env (dev or production)`
	)
	console.log(
		`${projectName !== "." ? "6" : "5"}. Generate keys: npm run keys (or yarn/pnpm equivalent)`
	)
	console.log(
		`${projectName !== "." ? "7" : "6"}. Start development: npm run dev (or yarn/pnpm equivalent)`
	)

	console.log(
		"\n📖 For more information, see the README.md file in your project"
	)
}

export async function initializeProject(): Promise<void> {
	const program = new Command()

	program
		.name("create-hybrid")
		.description("Create a new Hybrid XMTP agent project")
		.version("1.2.3")
		.argument("[project-name]", "Name of the project")
		.option("-e, --example <example>", "Example to use (basic, crypto-agent)")
		.action(async (projectName?: string, options?: { example?: string }) => {
			let finalProjectName = projectName

			// Debug logging for CI troubleshooting
			if (process.env.CI) {
				console.log(
					`🔍 Debug: projectName="${projectName}", options.example="${options?.example}"`
				)
			}

			// If no project name provided or empty string, prompt for it
			if (!finalProjectName || finalProjectName.trim() === "") {
				// Check if we're running in a non-interactive environment (like tests)
				if (!process.stdin.isTTY) {
					console.error("❌ Project name is required")
					process.exit(1)
				}

				const { name } = await prompts({
					type: "text",
					name: "name",
					message: "What is your project name?",
					validate: (value: string) => {
						if (!value || !value.trim()) {
							return "Project name is required"
						}
						return true
					}
				})

				if (!name) {
					console.log("❌ Project name is required. Exiting...")
					process.exit(1)
				}

				finalProjectName = name
			}

			await createProject(finalProjectName as string, options?.example)
		})

	await program.parseAsync()
}

async function main(): Promise<void> {
	const nodeVersion = process.versions.node
	const [major] = nodeVersion.split(".").map(Number)
	if (!major || major < 20) {
		console.error("Error: Node.js version 20 or higher is required")
		process.exit(1)
	}

	try {
		await initializeProject()
	} catch (error) {
		console.error("Failed to initialize project:", error)
		console.error(
			"Error details:",
			error instanceof Error ? error.stack : String(error)
		)
		process.exit(1)
	}
}

main().catch((error) => {
	console.error("CLI error:", error)
	console.error(
		"Error details:",
		error instanceof Error ? error.stack : String(error)
	)
	process.exit(1)
})
