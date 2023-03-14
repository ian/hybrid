#!/usr/bin/env node

import { Command } from "commander"
import { build } from "./cmd/build"
import { test } from "./cmd/test"
import { dev } from "./cmd/dev"
import { init } from "./cmd/init"
import { deploy } from "./cmd/deploy"
import boxen from "boxen"

if (process.argv[2] === "init") {
  // Handle init separately, best to not surface this in the help menu
  init()
} else {
  const program = new Command()
  program
    .name("mint")
    .description("The Hybrid NFT Development Framework")
    .version(require("../package.json").version)

  program
    .command("build")
    .description("Builds smart contracts and generates TS types")
    .action((/* opts */) => {
      build()
    })

  program
    .command("test")
    .description("Run smart contract tests")
    .action((/* opts */) => {
      test()
    })

  program
    .command("dev")
    .description("Starts hybrid in development mode")
    .action((/* opts */) => {
      dev()
    })

  program
    .command("deploy")
    .description("Deploy smart contracts")
    .argument("<contract>", "Contract name")
    .argument("<target>", "Deploy target [test|prod]")
    .action(async (contract, target) => {
      await deploy(contract, target).then(({ address, hash }) => {
        console.log()
        console.log(
          boxen(
            `Address: ${address}
Tx Hash: ${hash}`,
            {
              title: `Contract ${contract} Deployed to ${target}`,
              titleAlignment: "left",
              borderColor: "yellowBright",
              padding: 1,
              margin: 0.5,
              borderStyle: "double"
            }
          )
        )
        console.log()
      })
    })

  program.parse()
}
