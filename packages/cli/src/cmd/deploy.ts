import { readConfig } from "../lib/builder"
import { waitForDeployment } from "../lib/localBridge"

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

    const data = await waitForDeployment(contract.bytecode, chainId).catch(
      (msg) => {
        console.log(msg)
        process.exit()
      }
    )
  } else {
    console.log("Unknown deploy target", target)
    process.exit()
  }
}
