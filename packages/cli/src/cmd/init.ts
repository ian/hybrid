import chalk from "chalk"
import fs from "fs"
import ora from "ora"
import type { Ora } from "ora"
import path from "path"
import inquirer from "inquirer"
import { exec, writeFile } from "../lib/run"

export async function init() {
  const mdVersion = require("../../package.json").version

  console.log(`
Hybrid - Solidity + TypeScript Framework for Web3 Development
Installing Hybrid v${mdVersion} ...
`)

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
        "Base"
      ]
    }
  ])

  await spinner("Installing Hybrid", async () => {
    exec(`${pkgManager} add hybrid`, {
      cwd
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
      `
# Hybrid Production Runtime 

Make sure to commit this directory to your repository. It contains 
the compiled contracts and the deployment information.

### .gitignore

There's a gitignore file in here, don't commit the following directories:

- cache
- out

`
    )

    writeFile(
      path.join(cwd, ".hybrid", "client.ts"),
      `
// Runtime client library for Hybrid apps

let target

if (process.env.NODE_ENV === "production") {
  // in prod, use HYBRID_ENV or default to prod
  if (
    process.env.HYBRID_ENV === "test" ||
    process.env.NEXT_PUBLIC_HYBRID_ENV === "test"
  ) {
    target = "test"
  } else {
    target = "prod"
  }
} else {
  // allow HYBRID_ENV to override dev
  target = process.env.HYBRID_ENV || process.env.NEXT_PUBLIC_HYBRID_ENV || "dev"
}

type DeployedContract = {
  address: string
  chainId: number
  txHash: string
  blockHash: string
  blockNumber: number
  abi: any[]
  bytecode: string
}

let contents = {}

try {
  if (target === "dev") {
    contents = require("./cache/dev.json")
  } else {
    contents = require("./" + target + ".json")
  }
} catch (err) {
  console.log("Error loading deployments for target " + target)
  console.error(err)
}

export const Deployments: Record<string, DeployedContract> = contents
`
    )
  })

  await spinner("Installing foundry", async () => {
    await exec("curl -L https://foundry.paradigm.xyz | bash", {
      cwd
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
    const solidityPragma = "pragma solidity ^0.8.13"

    await fs.mkdirSync(path.join(cwd, "contracts"), { recursive: true })

    await writeFile(
      [cwd, "contracts/MyNFT.sol"].join("/"),
      `// SPDX-License-Identifier: UNLICENSED
${solidityPragma};

import "erc721a/contracts/ERC721A.sol";

contract MyNFT is ERC721A {
  constructor() ERC721A("My NFT", "NFT") {}

  // We prefer tokenIds to start at 1
  function _startTokenId() internal pure override returns (uint256) {
    return 1;
  }

  function mint(uint256 quantity) external payable {
    _mint(msg.sender, quantity);
  }

  /**
   * @dev override both ERC721A and ERC2981
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view override(ERC721A) returns (bool) {
    return ERC721A.supportsInterface(interfaceId);
  }
}
    `
    )

    await writeFile(
      [cwd, "contracts/MyNFT.test.sol"].join("/"),
      `// SPDX-License-Identifier: UNLICENSED
${solidityPragma};

import "forge-std/console.sol";
import "forge-std/Test.sol";

import "./MyNFT.sol";

contract MyContractTest is Test {
  MyNFT public mock;

  function setUp() public {
    mock = new MyNFT();
  }

  function testMint() public {
    address minter = makeAddr("minter");
    assertEq(mock.balanceOf(minter), 0);
    vm.prank(minter);
    mock.mint(1);
    assertEq(mock.balanceOf(minter), 1);
  }
}
    `
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
