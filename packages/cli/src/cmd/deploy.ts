import ora from "ora"
import { readConfig } from "../lib/builder"
import { waitForDeployment } from "../lib/localBridge"
import { etherscanTxURL } from "../lib/etherscan"

export async function deploy(contractName: string, target: string) {
  const config = readConfig()

  const contract = config[contractName]
  if (!contract) {
    console.log("Contract not found:", contractName)
    process.exit()
  }

  if (target === "prod") {
    console.log("Prod deployment not yet supported")
    process.exit()
  } else if (target === "test") {
    const chainId = 5

    const spiner = ora("Waiting for deployment in browser ...").start()
    const data = await waitForDeployment(contract.bytecode, chainId).catch(
      (msg) => {
        console.log(msg)
        process.exit()
      }
    )
    spiner.succeed("Contract deployed to testnet")
    console.log()
    console.log("Contract:    ", data.address)
    console.log("Transaction: ", data.txHash)
    console.log("Block Num:   ", data.address)
    console.log("View on Etherscan: " + etherscanTxURL(data.txHash, chainId))
  } else {
    console.log("Unknown deploy target", target)
    process.exit()
  }
}
