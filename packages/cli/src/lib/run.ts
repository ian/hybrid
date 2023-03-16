import child from "child_process"
import fs from "fs"

export async function writeFile(path: string, data: string) {
  return fs.writeFileSync(path, data)
}

export type SpawnOpts = {
  cwd?: string
  encoding?: string
  stdout?: (data: string) => void
  stderr?: (data: string) => void
  error?: (error: Error) => void
  close?: (code: number) => void
}

export function spawn(
  cmd: string,
  args: string[],
  opts: SpawnOpts = {
    encoding: "utf8"
  }
) {
  const install = child.spawn(cmd, args, opts)

  install.stdout.on("data", (data: any) => {
    opts.stdout?.(data.toString())
  })

  install.stderr.on("data", (data: any) => {
    opts.stderr?.(data.toString())
  })

  install.on("error", (error: Error) => {
    opts.error?.(error)
  })

  install.on("close", (code: number) => {
    opts.close?.(code)
  })

  return install
}

export function exec(cmd: string, opts: SpawnOpts = {}) {
  return child.execSync(cmd, { cwd: opts.cwd, stdio: "inherit" })
}
