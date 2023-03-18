import ora from "ora"
import { waitForDeployment } from "../lib/localBridge"
import { etherscanTxURL } from "../lib/etherscan"
import { getArtifact } from "../lib/foundry"
import { DeployTarget } from "../types"
import { writeConfig } from "../lib/config"

export async function deploy(contractName: string, target: DeployTarget) {
  const contract = await getArtifact(contractName)
  // const contract = artifacts[contractName]
  // console.log(artifacts)

  if (!contract) {
    console.log("Contract not found:", contractName)
    process.exit()
  }

  if (target === "prod") {
    const chainId = 1
    await deployInBrowser(contract.bytecode, chainId)
      .then((deploy) => writeConfig(target, contractName, deploy, contract))
      .catch((msg) => {
        console.log(msg)
        process.exit()
      })
  } else if (target === "test") {
    const chainId = 5
    await deployInBrowser(contract.bytecode, chainId)
      .then((deploy) => writeConfig(target, contractName, deploy, contract))
      .catch((msg) => {
        console.log(msg)
        process.exit()
      })
  } else {
    console.log("Unknown deploy target", target)
    process.exit()
  }
}

async function deployInBrowser(bytecode: string, chainId: number) {
  const spiner = ora("Waiting for deployment in browser ...").start()
  const deployment = await waitForDeployment(bytecode, chainId)
  spiner.succeed("Contract deployed to testnet")

  console.log()
  console.log("Contract:    ", deployment.address)
  console.log("Transaction: ", deployment.txHash)
  console.log("Block Num:   ", deployment.address)
  console.log(
    "View on Etherscan: " + etherscanTxURL(deployment.txHash, chainId)
  )

  return deployment
}
