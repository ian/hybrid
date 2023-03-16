import bip39 from "bip39"
import chokidar from "chokidar"
import crypto from "crypto"
import path from "path"
import fs from "fs"
import { anvil, forgeDeploy } from "../lib/foundry"
import boxen from "boxen"
import ora from "ora"
import { writeConfig } from "../lib/builder"

// @todo
// [] - switch to config object for paths
// [] - solve sighup issue for anvil
// [] - add a dev ui
// [] - checksum files to avoid recompiling

export async function dev() {
  const contractsDir = process.cwd() + "/contracts"
  const forkUrl = "https://goerli.infura.io/v3/e6481145ca1442b7bf2a8444a8cd0fc8"
  const mnemonic = bip39.generateMnemonic()

  const [testnet] = await Promise.all([
    anvil(mnemonic, forkUrl).finally(() => console.log("Anvil exited"))
    // @todo - some sort of dev interface
  ])

  console.log()
  console.log(
    boxen(
      `
Dev UI    | http://127.0.0.1:8580
RPC Node  | http://${testnet.host}:${testnet.port}
----------+----------------------
Docs      | https://hybrid.dev
Watching  | ${"./" + path.relative(process.cwd(), contractsDir)}
`.trim(),
      {
        title: "Hybrid Dev Server",
        titleAlignment: "left",
        borderColor: "greenBright",

        padding: 1,
        margin: 0.5,
        borderStyle: "double"
      }
    )
  )
  console.log()
  console.log("Keys:")
  console.log(testnet.keys.join("\n"))
  console.log()

  // listCompiled().then((files) => {
  //   return files.map((file) =>
  //     readCompiled(file).then(({ abi, bytecode }) =>
  //       deployContract({
  //         privateKey: testnet.keys[0],
  //         abi,
  //         bytecode
  //       }).then(console.log)
  //     )
  //   )
  // })

  chokidar.watch(contractsDir).on("all", async (event, file) => {
    if (event === "change") {
      await fileChanged(file, testnet)
    }
  })
}

// async function compileAndDeployAll() {

// }

const checksums: { [file: string]: string } = {}

async function fileChanged(file: string, blockchain) {
  const filename = path.basename(file)
  const name = filename.replace(".sol", "")

  if (!filename.endsWith(".sol")) {
    return
  }

  if (filename.endsWith(".test.sol")) {
    return
  }

  const checksum = await fileChecksum(file)
  // If the file hasn't changed, no need to redeploy
  if (checksums[file] === checksum) return
  checksums[file] = checksum

  const spinner = ora("Deploying " + name).start()

  forgeDeploy(name, "http://localhost:8545", blockchain.keys[0]).then(
    ({ address }) => {
      writeConfig()
      spinner.succeed(name + " deployed to " + address)
    }
  )
}

async function fileChecksum(file) {
  const str = fs.readFileSync(file).toString()
  return crypto.createHash("md5").update(str, "utf8").digest("hex")
}

// const readCompiled = async (file: string) => {
//   const distDir = process.cwd() + "/.hybrid/out"
//   const filename = path.basename(file)
//   const name = filename.replace(".sol", "")
//   const contents = await fs
//     .readFileSync(`${distDir}/${filename}/${name}.json`)
//     .toString()
//   return JSON.parse(contents)
// }
