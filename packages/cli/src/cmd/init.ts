import degit from "degit"
import { readFile, readdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { createInterface } from "node:readline"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

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

// Initialize a new hybrid project
export async function initializeProject() {
	console.log("🚀 Creating a new Hybrid project...")

	// Get project name
	const projectNameArg = process.argv[3] // Allow passing name as argument
	let projectName = projectNameArg

	// Check if an empty string was explicitly passed
	if (projectNameArg === "") {
		console.error("❌ Project name is required")
		process.exit(1)
	}

	if (!projectName || !projectName.trim()) {
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
				console.error(
					`❌ Directory "${sanitizedName}" already exists and is not empty`
				)
				console.error(
					"Please choose a different name or remove the existing directory"
				)
				process.exit(1)
			}
		} catch {
			// Directory doesn't exist, which is fine
		}
	} else {
		try {
			const existingFiles = await readdir(currentDir)
			const significantFiles = existingFiles.filter(
				(file) =>
					!file.startsWith(".") &&
					file !== "node_modules" &&
					file !== "package-lock.json" &&
					file !== "yarn.lock" &&
					file !== "pnpm-lock.yaml"
			)
			if (significantFiles.length > 0) {
				console.error(`❌ Current directory already exists and is not empty`)
				console.error(
					"Please choose a different directory or remove existing files"
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
		console.error(
			"❌ Failed to download template from GitHub:",
			error instanceof Error ? error.message : String(error)
		)
		console.log(
			"💡 Make sure you have internet connection and the repository/branch exists"
		)
		process.exit(1)
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
