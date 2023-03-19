import ora from "ora"
import { DeployTarget } from "@hybrd/types"
import { etherscanTxURL, writeConfig } from "@hybrd/utils"
import { waitForDeployment } from "../lib/localBridge"
import { getArtifact } from "../lib/foundry"

export async function deploy(contractName: string, target: DeployTarget) {
  const contract = await getArtifact(contractName)
  if (!contract) {
    console.log("Contract not found:", contractName)
    process.exit()
  }

  if (target === "prod") {
    const chainId = 1
    await deployInBrowser(contract.bytecode, chainId)
      .then((deploy) =>
        writeConfig(target, chainId, contractName, deploy, contract)
      )
      .catch((msg) => {
        console.log(msg)
        process.exit()
      })
  } else if (target === "test") {
    const chainId = 5
    await deployInBrowser(contract.bytecode, chainId)
      .then((deploy) =>
        writeConfig(target, chainId, contractName, deploy, contract)
      )
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
