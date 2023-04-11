import { DeployTarget } from "@hybrd/types"
import { etherscanTxURL } from "@hybrd/utils"

import { waitForDeployment } from "../lib/localBridge"
import { readConfig, writeDeployment } from "../lib/config"
import { getArtifact } from "../lib/foundry"
import { chainForStage } from "../lib/chains"
import { Abi } from "abitype"

export async function deploy(contractName: string, target: DeployTarget) {
  const contract = await getArtifact(contractName)
  if (!contract) {
    console.log("Contract not found:", contractName)
    process.exit()
  }

  const config = readConfig()
  const chain = chainForStage(config.chain, target)

  await deployInBrowser(contract.abi, contract.bytecode, chain.id)
    .then((deploy) =>
      writeDeployment(target, chain.id, contractName, deploy, contract)
    )
    .catch((msg) => {
      console.log(msg)
    })

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
