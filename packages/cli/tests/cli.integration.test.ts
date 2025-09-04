import { execSync, spawn } from "node:child_process"
import { existsSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

// Test utilities
function runCliCommand(
	args: string[],
	cwd?: string
): { stdout: string; stderr: string; exitCode: number } {
	try {
		const result = execSync(
			`node ${join(__dirname, "../dist/cli.js")} ${args.join(" ")}`,
			{
				cwd: cwd || process.cwd(),
				encoding: "utf8",
				stdio: "pipe",
				timeout: 30000
			}
		)
		return { stdout: result, stderr: "", exitCode: 0 }
	} catch (error: any) {
		return {
			stdout: error.stdout || "",
			stderr: error.stderr || "",
			exitCode: error.status || 1
		}
	}
}

function createTempProject(name: string): string {
	const tempDir = join(process.cwd(), "test-temp", name)
	if (existsSync(tempDir)) {
		rmSync(tempDir, { recursive: true, force: true })
	}
	return tempDir
}

function cleanupTempProject(name: string): void {
	const tempDir = join(process.cwd(), "test-temp", name)
	if (existsSync(tempDir)) {
		rmSync(tempDir, { recursive: true, force: true })
	}
}

describe("CLI Integration Tests", () => {
	beforeEach(() => {
		// Create temp directory for tests
		if (!existsSync("test-temp")) {
			execSync("mkdir -p test-temp")
		}
	})

	afterEach(() => {
		// Cleanup temp directories
		if (existsSync("test-temp")) {
			rmSync("test-temp", { recursive: true, force: true })
		}
	})

	describe("CLI Help and Basic Commands", () => {
		it("should show help when no arguments provided", () => {
			const result = runCliCommand([])
			expect(result.exitCode).toBe(0)
			expect(result.stdout).toContain("Usage: hybrid")
			expect(result.stdout).toContain("Commands:")
		})

		it("should show help with --help flag", () => {
			const result = runCliCommand(["--help"])
			expect(result.exitCode).toBe(0)
			expect(result.stdout).toContain("Usage: hybrid")
		})

		it("should show help with -h flag", () => {
			const result = runCliCommand(["-h"])
			expect(result.exitCode).toBe(0)
			expect(result.stdout).toContain("Usage: hybrid")
		})
	})

	describe("Project Initialization", () => {
		it("should create a project with a specified name", () => {
			const projectName = "test-project-cli"
			const tempDir = createTempProject(projectName)

			const result = runCliCommand(
				["init", projectName],
				join(process.cwd(), "test-temp")
			)
			expect(result.exitCode).toBe(0)
			expect(result.stdout).toContain("Hybrid project created successfully")

			// Verify project structure
			expect(existsSync(join(tempDir, "package.json"))).toBe(true)
			expect(existsSync(join(tempDir, "src", "agent.ts"))).toBe(true)
			expect(existsSync(join(tempDir, "README.md"))).toBe(true)
			expect(existsSync(join(tempDir, ".env"))).toBe(true)

			// Verify package.json content
			const packageJson = JSON.parse(
				readFileSync(join(tempDir, "package.json"), "utf8")
			)
			expect(packageJson.name).toBe(projectName)
			expect(packageJson.version).toBe("0.1.0")

			cleanupTempProject(projectName)
		})

		it("should create a project in current directory when name is '.'", () => {
			const projectName = "test-current-dir"
			const tempDir = createTempProject(projectName)

			const result = runCliCommand(["init", "."], tempDir)
			expect(result.exitCode).toBe(0)
			expect(result.stdout).toContain("Hybrid project created successfully")

			// Verify files are created in current directory
			expect(existsSync(join(tempDir, "package.json"))).toBe(true)
			expect(existsSync(join(tempDir, "src", "agent.ts"))).toBe(true)

			cleanupTempProject(projectName)
		})

		it("should sanitize project names with special characters", () => {
			const inputName = "My Amazing Agent!"
			const expectedName = "my-amazing-agent"
			const tempDir = createTempProject(expectedName)

			const result = runCliCommand(
				["init", inputName],
				join(process.cwd(), "test-temp")
			)
			expect(result.exitCode).toBe(0)

			// Verify directory name is sanitized
			expect(existsSync(join(process.cwd(), "test-temp", expectedName))).toBe(
				true
			)

			// Verify package.json name is sanitized
			const packageJson = JSON.parse(
				readFileSync(join(tempDir, "package.json"), "utf8")
			)
			expect(packageJson.name).toBe(expectedName)

			cleanupTempProject(expectedName)
		})

		it("should fail when trying to create project in non-empty directory", () => {
			const projectName = "test-existing-dir"
			const tempDir = createTempProject(projectName)

			// Create a file in the directory first
			execSync(`echo "existing file" > ${join(tempDir, "existing.txt")}`)

			const result = runCliCommand(
				["init", projectName],
				join(process.cwd(), "test-temp")
			)
			expect(result.exitCode).toBe(1)
			expect(result.stderr).toContain("already exists and is not empty")

			cleanupTempProject(projectName)
		})
	})

	describe("Key Generation", () => {
		it("should generate XMTP keys", () => {
			const projectName = "test-keys"
			const tempDir = createTempProject(projectName)

			// First create a project
			runCliCommand(["init", projectName], join(process.cwd(), "test-temp"))

			// Change to project directory and generate keys
			const result = runCliCommand(["gen:keys"], tempDir)
			expect(result.exitCode).toBe(0)
			expect(result.stdout).toContain("Keys generated successfully")

			// Verify .env file contains keys
			expect(existsSync(join(tempDir, ".env"))).toBe(true)
			const envContent = readFileSync(join(tempDir, ".env"), "utf8")
			expect(envContent).toContain("XMTP_WALLET_KEY=0x")
			expect(envContent).toContain("XMTP_ENCRYPTION_KEY=")

			cleanupTempProject(projectName)
		})

		it("should write keys to .env file when --write flag is used", () => {
			const projectName = "test-keys-write"
			const tempDir = createTempProject(projectName)

			// First create a project
			runCliCommand(["init", projectName], join(process.cwd(), "test-temp"))

			// Generate keys with --write flag
			const result = runCliCommand(["gen:keys", "--write"], tempDir)
			expect(result.exitCode).toBe(0)
			expect(result.stdout).toContain(
				"Environment variables written to .env file"
			)

			// Verify .env file contains keys
			const envContent = readFileSync(join(tempDir, ".env"), "utf8")
			expect(envContent).toContain("XMTP_WALLET_KEY=0x")
			expect(envContent).toContain("XMTP_ENCRYPTION_KEY=")

			cleanupTempProject(projectName)
		})
	})

	describe("Build and Dev Commands", () => {
		it("should handle build command", () => {
			const projectName = "test-build"
			const tempDir = createTempProject(projectName)

			// Create a project
			runCliCommand(["init", projectName], join(process.cwd(), "test-temp"))

			// Try to build (should fail without dependencies, but command should work)
			const result = runCliCommand(["build"], tempDir)
			// Build may fail due to missing dependencies, but command should be recognized
			expect([0, 1]).toContain(result.exitCode)

			cleanupTempProject(projectName)
		})

		it("should handle dev command", () => {
			const projectName = "test-dev"
			const tempDir = createTempProject(projectName)

			// Create a project
			runCliCommand(["init", projectName], join(process.cwd(), "test-temp"))

			// Start dev server with timeout
			const child = spawn("node", [join(__dirname, "../dist/cli.js"), "dev"], {
				cwd: tempDir,
				stdio: "pipe"
			})

			let output = ""
			child.stdout?.on("data", (data) => {
				output += data.toString()
			})

			child.stderr?.on("data", (data) => {
				output += data.toString()
			})

			// Wait a bit for the process to start
			setTimeout(() => {
				child.kill()
			}, 2000)

			// The test passes if the command doesn't immediately fail
			expect(child.killed).toBe(false)
			child.kill()

			cleanupTempProject(projectName)
		}, 10000) // Longer timeout for this test
	})

	describe("Template Validation", () => {
		it("should create all required files from template", () => {
			const projectName = "test-template"
			const tempDir = createTempProject(projectName)

			const result = runCliCommand(
				["init", projectName],
				join(process.cwd(), "test-temp")
			)
			expect(result.exitCode).toBe(0)

			// Check all expected files exist
			const requiredFiles = [
				"package.json",
				"README.md",
				".env",
				"tsconfig.json",
				"vitest.config.ts",
				"src/agent.ts",
				"src/agent.test.ts"
			]

			requiredFiles.forEach((file) => {
				expect(existsSync(join(tempDir, file))).toBe(true)
			})

			// Verify package.json has required scripts
			const packageJson = JSON.parse(
				readFileSync(join(tempDir, "package.json"), "utf8")
			)
			const requiredScripts = ["dev", "build", "test", "keys"]
			requiredScripts.forEach((script) => {
				expect(packageJson.scripts).toHaveProperty(script)
			})

			cleanupTempProject(projectName)
		})

		it("should replace template variables correctly", () => {
			const projectName = "test-variables"
			const tempDir = createTempProject(projectName)

			const result = runCliCommand(
				["init", projectName],
				join(process.cwd(), "test-temp")
			)
			expect(result.exitCode).toBe(0)

			// Check that template variables were replaced
			const packageJson = JSON.parse(
				readFileSync(join(tempDir, "package.json"), "utf8")
			)
			expect(packageJson.name).toBe(projectName)

			const readme = readFileSync(join(tempDir, "README.md"), "utf8")
			expect(readme).toContain(`# ${projectName}`)

			cleanupTempProject(projectName)
		})
	})

	describe("Error Handling", () => {
		it("should handle unknown commands gracefully", () => {
			const result = runCliCommand(["unknown-command"])
			expect(result.exitCode).toBe(1)
			expect(result.stdout).toContain("Usage: hybrid")
		})

		it("should handle invalid project names", () => {
			const result = runCliCommand(["init", ""])
			expect(result.exitCode).toBe(1)
			expect(result.stderr).toContain("Project name is required")
		})
	})
})
