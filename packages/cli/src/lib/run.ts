import { execSync, spawn } from "child_process"
import fs from "fs"

export async function writeFile(path: string, data: string) {
  return fs.writeFileSync(path, data)
}

export type SpawnOpts = {
  cwd?: string
  encoding?: string
  stdout?: (data: string) => void
  stderr?: (data: string) => void
}

export async function cmd(
  cmd: string,
  args: string[],
  opts: SpawnOpts = {
    encoding: "utf8"
  }
) {
  return new Promise((resolve, reject) => {
    const install = spawn(cmd, args, opts)

    install.stdout.on("data", (data: any) => {
      opts.stdout?.(data.toString())
    })

    install.stderr.on("data", (data: any) => {
      opts.stderr?.(data.toString())
    })

    install.on("error", (error: Error) => {
      reject(error)
    })

    install.on("close", (code: number) => {
      resolve(code)
    })
  })
}

export async function exec(cmd: string) {
  return execSync(cmd, { stdio: "inherit" })
}
