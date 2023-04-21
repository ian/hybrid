import { Abi } from "abitype"
import { Address } from "@wagmi/core"
import { providers } from "ethers"
import { Chain, Client as WagmiClient } from "wagmi"

export type CompiledContract = {
  abi: Abi
  bytecode: string
}

export type DeployedContract = {
  address: `0x${string}`
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

export type SendTransactionResult = {
  hash: `0x${string}`
  wait: providers.TransactionResponse["wait"]
}

export type {
  TransactionReceipt as Receipt,
  TransactionResponse as Transaction,
} from "@ethersproject/providers"

export type ProviderConfig = {
  hybridKey?: string
}

export type WalletConnectorOpts = object // todo - what config is common to all wallet plugins?
export type WalletConnection = {
  client: WagmiClient
  hooks: WalletConnectionHooks
  Provider: React.FC<WalletConnectorOpts>
}

export type WalletConnectionHooks = {
  useWallet: () => UseWallet
}

export type UseWallet = {
  readonly account: Address | undefined
  readonly isLoading: boolean
  readonly isConnected: boolean
  connect: () => void
  disconnect: () => void
}

export type WalletConnectorConfig = {
  chains: Chain[]
  providers: providers.BaseProvider[]
}

export type WalletConnector = (
  config: WalletConnectorConfig
) => WalletConnection
