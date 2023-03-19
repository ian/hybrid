import fs from "fs"
import { ChildProcessWithoutNullStreams } from "child_process"
import { CompiledContract } from "@hybrd/types"
import { SpawnOpts, spawn } from "./run"

export type BuildOpts = {
  // todo - add more options
} & SpawnOpts

export async function forgeBuild(opts: BuildOpts = {}) {
  return new Promise((resolve, reject) => {
    spawn("forge", ["build", "--force"], {
      ...opts,
      // hijack the stderr and reject if anything comes thru
      stderr: (msg) => reject(msg),
      close: resolve
    })
  })
}

export async function forgeDeploy(name: string, rpc: string, key: string) {
  const output: string[] = []
  const error: string[] = []

  await new Promise((resolve) =>
    spawn("forge", ["create", name, `--rpc-url`, rpc, "--private-key", key], {
      stdout: (msg) => output.push(msg),
      stderr: (err) => error.push(err),
      close: resolve
    })
  )

  const address = output.join("").match(/Deployed to: (0x.{40})/)
  const hash = output.join("").match(/Transaction hash: (0x.{64})/)

  return {
    address: address ? address[1] : null,
    txHash: hash ? hash[1] : null
  }
}

type AnvilListening = {
  proc: ChildProcessWithoutNullStreams
  chainId: number
  host: string
  port: string
  keys: `0x${string}`[]
}

export async function anvil(
  mnemonic: string,
  forkUrl: string
): Promise<AnvilListening> {
  return new Promise((resolve) => {
    const chainId = 1337 // @todo - make this configurable
    const proc = spawn(
      "anvil",
      [
        "--mnemonic",
        mnemonic,
        "--fork-url",
        forkUrl,
        "--chain-id",
        chainId.toString()
      ],
      {
        stdout: (str) => {
          const keys = str.match(/0x.{64}/g) as `0x${string}`[]
          const listens = str.match(/Listening on (.*?)\n/)

          if (listens) {
            const [host, port] = listens[1].split(":")
            resolve({
              proc,
              chainId,
              host,
              port,
              keys
            })
          }
        },
        stderr: (str) => console.error(str),
        error: (str) => console.error(str)
      }
    )
  })
}

export async function getArtifact(name: string): Promise<CompiledContract> {
  const json = JSON.parse(
    fs
      .readFileSync(process.cwd() + `/.hybrid/out/${name}.sol/${name}.json`)
      .toString()
  )

  return {
    abi: json.abi,
    bytecode: json.bytecode.object
  }
}
