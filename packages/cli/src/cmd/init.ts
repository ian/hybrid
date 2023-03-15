import chalk from "chalk"
import fs from "fs"
import path from "path"
import inquirer from "inquirer"
import { cmd, exec, writeFile } from "../lib/run"
import { spinner } from "../lib/util"

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
    cmd(pkgManager, ["add", "hybrid"], {
      cwd
    })

    exec(`echo '.hybrid' >> .gitignore`)
  })

  await spinner("Adding smart contracts", async () => {
    const solidityPragma = "pragma solidity ^0.8.13"

    await cmd("sh", ["-c", "curl -L https://foundry.paradigm.xyz | bash"], {
      cwd
    })

    await cmd("foundryup", [], {
      cwd
    })

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

    await fs.mkdirSync([cwd, "contracts"].join("/"), { recursive: true })

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

  await spinner("Adding hybrid.config.js", async () =>
    writeFile(
      [cwd, "hybrid.config.js"].join("/"),
      `
  module.exports = {
    token: "",
    chain: "${answers.chain}",
  }
    `
    )
  )

  console.log(
    chalk.green.bold("Success!"),
    `Hybrid Installed`,
    path.relative(process.cwd(), cwd)
  )
  console.log()
  console.log("To get started, run", chalk.yellow.bold("hy dev"))
  console.log()
  console.log()
}
