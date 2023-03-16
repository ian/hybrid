import inquirer from "inquirer"
import { forgeDeploy } from "../lib/foundry"

export async function deploy(contract: string, target: string) {
  // "contracts:goerli": "forge create contracts/src/MintingTest.sol:MintingTest --constructor-args-path ./contracts/.args.goerli --verify --etherscan-api-key $ETHERSCAN_API_KEY --chain goerli --rpc-url $GOERLI_RPC_URL --interactive",
  // "contracts:mainnet": "forge create contracts/src/AerialExplorers.sol:AerialExplorers --gas-limit 3000000 --constructor-args-path ./contracts/.args.mainnet --verify --etherscan-api-key $ETHERSCAN_API_KEY --chain mainnet --rpc-url $MAINNET_RPC_URL --interactive",

  const { key } = await inquirer.prompt([
    {
      name: "key",
      message: "Private Key",
      type: "input"
    }
  ])

  switch (target) {
    case "local":
      return forgeDeploy(contract, "http://localhost:8545", key)
    default:
      throw new Error("Unknown target" + target)
  }
}
