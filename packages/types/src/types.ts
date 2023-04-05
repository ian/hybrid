import { Abi } from "abitype"
import { providers } from "ethers"
import { Chain, Client as WagmiClient } from "wagmi"

export type CompiledContract = {
  abi: Abi
  bytecode: string
}

export type DeployedContract = {
  address: string
  chainId: number
} & CompiledContract

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

export type ProviderKeys = {
  alchemyKey?: string
  infuraKey?: string
  // hybridKey?: string
}

export type WalletConnectorOpts = object // todo - what config is common to all wallet plugins?
export type WalletConnection = {
  client: WagmiClient
  useContext: () => WalletConnectorContext
  Provider: React.FC<WalletConnectorOpts>
}
export type WalletConnectorContext = {
  connect: () => void
}
export type WalletConnectorConfig = {
  chains: Chain[]
  providers: providers.BaseProvider[]
}

export type WalletConnector = (
  config: WalletConnectorConfig
) => WalletConnection
