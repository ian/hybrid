import chalk from "chalk"
import fs from "fs"
import ora from "ora"
import type { Ora } from "ora"
import path from "path"
import inquirer from "inquirer"
import { exec, writeFile } from "../lib/run"
import { version } from "../../package.json"

export async function init() {
  opener()

  if (!fs.existsSync("./package.json")) {
    console.error(
      chalk.red("Error: No package.json found. Are you in the right directory?")
    )
    process.exit()
  }

  const pkgManager = fs.existsSync("./yarn.lock")
    ? "yarn"
    : fs.existsSync("./pnpm-lock.yaml")
    ? "pnpm"
    : "npm"

  const cwd = process.cwd()
  const answers = await inquirer.prompt([
    {
      name: "chain",
      type: "list",
      choices: [
        "Ethereum",
        "Polygon",
        "Arbitrum",
        "Binance Smart Chain",
        "Base",
      ],
    },
  ])

  await spinner("Installing Hybrid", async () => {
    exec(`${pkgManager} add hybrid`, {
      cwd,
    })

    await fs.mkdirSync(path.join(cwd, ".hybrid"), { recursive: true })

    writeFile(
      path.join(cwd, "hybrid.config.js"),
      `
module.exports = {
  chain: "${answers.chain}",
  foundry: {
    src: "./contracts",
    test: "./contracts",
    cache: true,
    cache_path: ".hybrid/cache",
    out: ".hybrid/out",
    gas_reports: ["*"],
    libs = ["node_modules"]
  }
}
`
    )

    writeFile(
      path.join(cwd, ".hybrid", ".gitignore"),
      `cache
out
`
    )

    writeFile(
      path.join(cwd, ".hybrid", "README.md"),
      fs.readFileSync("../templates/client.d.ts").toString()
    )

    writeFile(
      path.join(cwd, ".hybrid", "client.js"),
      fs.readFileSync("../templates/client.js").toString()
    )

    writeFile(
      path.join(cwd, ".hybrid", "client.d.ts"),
      fs.readFileSync("../templates/client.d.ts").toString()
    )
  })

  await spinner("Installing foundry", async () => {
    await exec("curl -L https://foundry.paradigm.xyz | bash", {
      cwd,
    })

    await exec("foundryup", { cwd })

    await writeFile(
      [cwd, "foundry.toml"].join("/"),
      `# See more config options https://github.com/foundry-rs/foundry/tree/master/config

[profile.default]
src = './contracts'
test = './contracts'
cache = true
cache_path = '.hybrid/cache'
out = '.hybrid/out'
libs = ["node_modules"]
gas_reports = ["*"]`
    )
  })

  await spinner("Adding smart contracts", async () => {
    await fs.mkdirSync(path.join(cwd, "contracts"), { recursive: true })

    await writeFile(
      [cwd, "contracts/MyNFT.sol"].join("/"),
      fs.readFileSync("../templates/contracts/ERC721/NFT.sol").toString()
    )

    await writeFile(
      [cwd, "contracts/MyNFT.test.sol"].join("/"),
      fs.readFileSync("../templates/contracts/ERC721/NFT.test.sol").toString()
    )
  })

  console.log(
    chalk.green.bold("Success!"),
    `Hybrid Installed`,
    path.relative(process.cwd(), cwd)
  )
  console.log()
  console.log("To get started, run", chalk.yellow.bold("hybrid dev"))
  console.log()
  console.log()
}

function spinner(label: string, fn: () => Promise<any>) {
  let spinner: Ora
  if (label) spinner = ora(label).start()

  return fn()
    .then(() => {
      spinner?.succeed(`${label} ... DONE`)
      return spinner
    })
    .catch((err) => {
      spinner?.fail(`${label}`)
      console.error(err)
    })
}

function opener() {
  // generated via https://ascii-generator.site
  console.log(`
  ..................................................
  ..................................................
  ...........%########......%########...............
  ..........#=-:::::::+....*=-:::::::*..............
  .........*===-:::::::=..*===-:::::::+.............
  ........+=====-:::::::=+=====-:::::::=............
  ........+=======-:::::::-=====-:::::::=%..........
  .........+=======-:::::::------::::::::-%.........
  ..........*=======-:::::::::::::::::::::-#........
  ...........*=======-----------------------%.......
  ..........#+++++++=----------------------#........
  .........*+++++++=---------------------=%.........
  ........*+++++++--------+++++++-------=...........
  ........*++++++-------=*++++++-------+............
  .........#+++=-------+..*+++=-------+.............
  ..........#+=-------*....#+=-------*..............
  ...........%########......%#######%...............
  ..................................................
  ..................................................

  Hybrid - v${version}
  Solidity + TypeScript Framework for Web3 Development
`)
}
