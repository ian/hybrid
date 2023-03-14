import bip39 from "bip39"
import chokidar from "chokidar"
import path from "path"
import { anvil, forgeDeploy } from "../lib/foundry"
import boxen from "boxen"
import ora from "ora"
import { writeConfig } from "../lib/builder"

// @todo
// [] - switch to config object for paths

export async function dev() {
  const contractsDir = process.cwd() + "/contracts"
  const forkUrl = "https://goerli.infura.io/v3/e6481145ca1442b7bf2a8444a8cd0fc8"
  const mnemonic = bip39.generateMnemonic()

  const [testnet] = await Promise.all([
    anvil(mnemonic, forkUrl)
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

  chokidar.watch(contractsDir).on("all", (event, file) => {
    switch (event) {
      // case "add":
      //   console.log(event, path)
      //   break

      case "change":
        if (!file.endsWith(".sol")) return
        if (file.endsWith(".test.sol")) {
          // console.log("Skipping test file", file)
          return
        } else {
          // build().then(() => {

          // })

          const filename = path.basename(file)
          const name = filename.replace(".sol", "")

          let spinner = ora("Deploying " + name).start()
          forgeDeploy(name, "http://localhost:8545", testnet.keys[0]).then(
            ({ address }) => {
              writeConfig()
              spinner.succeed(name + " deployed to " + address)
            }
          )

          // .then(() => readCompiled(file))
          // .then(
          //   ({ abi, bytecode }) =>
          //     forgeDeploy(contract, "http://localhost:8545", key)
          //   // deployContract({
          //   //   privateKey: testnet.keys[0],
          //   //   abi,
          //   //   bytecode
          //   // }).then(console.log)
          // )
        }

        break
      default:
        // console.log(event, path)
        break
    }
  })
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
