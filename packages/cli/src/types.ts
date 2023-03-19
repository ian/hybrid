import { Abi } from "abitype"

export type CompiledContract = {
  abi: Abi
  bytecode: string
}

export type DeployTarget = "test" | "prod"

export type Deployment = {
  address: string
  deployer: string
  txHash: string
  blockHash: string
  blockNumber: number
}
