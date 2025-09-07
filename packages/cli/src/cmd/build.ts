import { spawn } from "node:child_process"

// Build the project
export function runBuild() {
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
