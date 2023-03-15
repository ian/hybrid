import { SpawnOpts, cmd } from "./run"

export type BuildOpts = {
  // todo - add more options
} & SpawnOpts

export async function build(opts: BuildOpts = {}) {
  return new Promise((resolve, reject) => {
    cmd("forge", ["build", "--force"], {
      ...opts,
      // hijack the stderr and reject if anything comes thru
      stderr: (msg) => reject(msg)
    }).then(resolve)
  })
}

export async function forgeDeploy(name: string, rpc: string, key: string) {
  const output: string[] = []
  const error: string[] = []

  await cmd("forge", ["create", name, `--rpc-url`, rpc, "--private-key", key], {
    stdout: (msg) => output.push(msg),
    stderr: (err) => error.push(err)
  })

  const address = output.join("").match(/Deployed to: (0x.{40})/)
  const hash = output.join("").match(/Transaction hash: (0x.{64})/)

  return {
    address: address ? address[1] : null,
    hash: hash ? hash[1] : null
  }
}

type AnvilListening = {
  host: string
  port: string
  keys: `0x${string}`[]
}

export async function anvil(
  mnemonic: string,
  forkUrl: string
): Promise<AnvilListening> {
  return new Promise((resolve) => {
    cmd(
      "anvil",
      ["--mnemonic", mnemonic, "--fork-url", forkUrl, "--chain-id", "1337"],
      {
        stdout: (str) => {
          const keys = str.match(/0x.{64}/g) as `0x${string}`[]
          const listens = str.match(/Listening on (.*?)\n/)

          if (listens) {
            const [host, port] = listens[1].split(":")
            resolve({
              host,
              port,
              keys
            })
          }
        },
        stderr: (str) => process.stderr.write(str)
      }
    )
  })
}
