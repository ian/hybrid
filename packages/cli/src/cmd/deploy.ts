import inquirer from "inquirer"
import { forgeDeploy } from "../lib/foundry"
import boxen from "boxen"
import { readConfig } from "../lib/builder"
import { waitForDeployment } from "../lib/localBridge"

export async function deploy(contractName: string, target: string) {
  // "contracts:mainnet": "forge create contracts/src/AerialExplorers.sol:AerialExplorers --gas-limit 3000000 --constructor-args-path ./contracts/.args.mainnet --verify --etherscan-api-key $ETHERSCAN_API_KEY --chain mainnet --rpc-url $MAINNET_RPC_URL --interactive",

  switch (target) {
    // For prod and testnet, we use an in-browser experience to deploy
    case "test":
      const config = readConfig()

      const contract = config[contractName]
      if (!contract) {
        console.log("Contract not found:", contractName)
        process.exit()
      }

      const chainId = 5

      const data = await waitForDeployment(contract.bytecode, chainId).catch(
        (msg) => {
          console.log(msg)
          process.exit()
        }
      )
      console.log(data)

      break

    // Local deployment is done differently
    case "local":
      // TODO - pull this from local config somehow
      const { key } = await inquirer.prompt([
        {
          name: "key",
          message: "Private Key",
          type: "input"
        }
      ])

      return forgeDeploy(contract, "http://localhost:8545", key).then(
        ({ address, hash }) => {
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
        }
      )
    default:
      throw new Error("Unknown target" + target)
  }
}
