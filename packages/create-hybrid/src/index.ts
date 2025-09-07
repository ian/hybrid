import { readFile, readdir, writeFile, mkdir, copyFile, stat } from "node:fs/promises"
import { dirname, join } from "node:path"
import { createInterface } from "node:readline"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

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

function replaceTemplateVariables(
	content: string,
	variables: Record<string, string>
): string {
	return content.replace(
		/\{\{(\w+)\}\}/g,
		(match, key) => variables[key] || match
	)
}

async function copyTemplate(sourceDir: string, targetDir: string): Promise<void> {
	const entries = await readdir(sourceDir, { withFileTypes: true })
	
	for (const entry of entries) {
		const sourcePath = join(sourceDir, entry.name)
		const targetPath = join(targetDir, entry.name)
		
		if (entry.isDirectory()) {
			await mkdir(targetPath, { recursive: true })
			await copyTemplate(sourcePath, targetPath)
		} else {
			await copyFile(sourcePath, targetPath)
		}
	}
}

export async function initializeProject() {
	console.log("🚀 Creating a new Hybrid project...")

	const projectNameArg = process.argv[2]
	let projectName = projectNameArg

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

	const sanitizedName = projectName
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")

	const currentDir = process.cwd()
	const projectDir =
		projectName === "." ? currentDir : join(currentDir, sanitizedName)

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
		}
	}

	console.log("📦 Copying template files...")
	
	const templateDir = join(__dirname, "..", "templates", "agent")
	
	try {
		await stat(templateDir)
	} catch {
		console.error("❌ Template directory not found")
		process.exit(1)
	}

	try {
		await mkdir(projectDir, { recursive: true })
		await copyTemplate(templateDir, projectDir)
		console.log(`✅ Template files copied to: ${sanitizedName}`)
	} catch (error) {
		console.error("❌ Failed to copy template files:", error)
		process.exit(1)
	}

	const variables = {
		projectName: sanitizedName
	}

	try {
		const filesToUpdate = [
			join(projectDir, "package.json"),
			join(projectDir, "README.md"),
			join(projectDir, "src", "agent.ts")
		]

		for (const filePath of filesToUpdate) {
			try {
				let content = await readFile(filePath, "utf-8")
				content = replaceTemplateVariables(content, variables)
				await writeFile(filePath, content, "utf-8")
			} catch (error) {
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

async function main() {
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
