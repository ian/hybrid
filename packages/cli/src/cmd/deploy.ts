import { DeployTarget } from "@hybrd/types"
import { etherscanTxURL } from "@hybrd/utils"

import { waitForDeployment } from "../lib/localBridge"
import { writeConfig } from "../lib/config"
import { getArtifact } from "../lib/foundry"

export async function deploy(contractName: string, target: DeployTarget) {
  const contract = await getArtifact(contractName)
  if (!contract) {
    console.log("Contract not found:", contractName)
    process.exit()
  }

  if (target === "prod") {
    const chainId = 1
    await deployInBrowser(contract.abi, contract.bytecode, chainId)
      .then((deploy) =>
        writeConfig(target, chainId, contractName, deploy, contract)
      )
      .catch((msg) => {
        console.log(msg)
      })
  } else if (target === "test") {
    const chainId = 5
    await deployInBrowser(contract.abi, contract.bytecode, chainId)
      .then((deploy) =>
        writeConfig(target, chainId, contractName, deploy, contract)
      )
      .catch((msg) => {
        console.log(msg)
      })
  } else {
    console.log("Unknown deploy target", target)
  }

  process.exit()
}

async function deployInBrowser(abi: Abi, bytecode: string, chainId: number) {
  const deployment = await waitForDeployment(abi, bytecode, chainId)

  console.log()
  console.log("Contract:    ", deployment.address)
  console.log("Transaction: ", deployment.txHash)
  console.log("Block Num:   ", deployment.address)
  console.log(
    "View on Etherscan: " + etherscanTxURL(deployment.txHash, chainId)
  )

  return deployment
}
