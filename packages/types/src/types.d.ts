import { Abi } from "abitype"

export type CompiledContract = {
  abi: Abi
  bytecode: string
  address: string
  chainId: number
}

export type DeployTarget = "test" | "prod"

export type Deployment = {
  address: string
  deployer: string
  txHash: string
  blockHash: string
  blockNumber: number
}

export type {
  TransactionReceipt as Receipt,
  TransactionResponse as Transaction
} from "@ethersproject/providers"
