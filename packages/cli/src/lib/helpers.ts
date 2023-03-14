import { spawn } from "child_process"
import fs from "fs"
import ora, { Ora } from "ora"

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

export async function spinner(label: string, fn: () => Promise<any>) {
  let spinner: Ora
  if (label) spinner = ora(label).start()
  return fn()
    .then(() => {
      spinner?.succeed(`${label} ... DONE`)
    })
    .catch((err) => {
      spinner?.fail(`${label}`)
      console.error(err)
    })
}
