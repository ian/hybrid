import chalk from "chalk"
import fs from "fs"
import ora from "ora"
import type { Ora } from "ora"
import path from "path"
import inquirer from "inquirer"
import { exec, writeFile } from "../lib/run"
import { version } from "../../package.json"
import { templates } from "../lib/config"

import { write as writeERC721A } from "../gen/ERC721A"
import { CHAIN_NAMES } from "@hybrd/utils"

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
      choices: CHAIN_NAMES,
    },
  ])

  await spinner("Installing Hybrid", async () => {
    exec(`${pkgManager} add hybrid wagmi ethers@5`, {
      cwd,
    })

    await fs.mkdirSync(path.join(cwd, ".hybrid"), { recursive: true })

    writeFile(
      path.join(cwd, "hybrid.config.js"),
      templates["hybrid.config.js"](answers.chain)
    )

    writeFile(
      path.join(cwd, ".hybrid", "package.json"),
      templates["package.json"]
    )
    writeFile(path.join(cwd, ".hybrid", ".gitignore"), templates[".gitignore"])
    writeFile(path.join(cwd, ".hybrid", "README.md"), templates["README.md"])
    writeFile(path.join(cwd, ".hybrid", "client.js"), templates["client.js"])

    writeFile(
      path.join(cwd, ".hybrid", "client.d.ts"),
      templates["client.d.ts"]
    )
  })

  await spinner("Installing foundry", async () => {
    await exec("curl -L https://foundry.paradigm.xyz | bash", {
      cwd,
    })

    await exec("foundryup", { cwd })
    await writeFile([cwd, "foundry.toml"].join("/"), templates["foundry.toml"])
  })

  await spinner("Adding smart contracts", async () => {
    await fs.mkdirSync(path.join(cwd, "contracts"), { recursive: true })
    await writeERC721A(path.join(cwd, "contracts"))
  })

  console.log()
  console.log(
    chalk.green.bold("Success!"),
    `Hybrid Installed`,
    path.relative(process.cwd(), cwd)
  )

  console.log()
  console.log("To get started, run", chalk.yellow.bold("hybrid dev"))
  console.log()
}

function spinner<T>(label: string, fn: () => Promise<T>) {
  let spinner: Ora
  if (label) spinner = ora(label).start()

  return fn()
    .then((res) => {
      spinner?.succeed(`${label} ... DONE`)
      return res
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
