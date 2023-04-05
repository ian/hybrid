import { WagmiConfig, Client } from "wagmi"
import {
  mainnet,
  goerli,
  localhost,
  arbitrum,
  arbitrumGoerli
} from "wagmi/chains"

import React from "react"
// import { Provider } from "@ethersproject/providers"
import {
  ProviderKeys,
  WalletConnector,
  WalletConnectorContext
} from "@hybrd/types"
import createDefaultWalletConnector from "./DefaultWalletConnector"
import { buildProviders } from "./helpers"

export type Config = {
  // appName?: string
  // alchemyKey?: string
  // infuraKey?: string
  // publicProvider?: boolean
}

// export const withHybrid = (InputComponent, config: Config = {}) => {
//   return function WithHybrid(props) {
//     return (
//       <Web3Provider {...config}>
//         <InputComponent {...props} />
//       </Web3Provider>
//     )
//   }
// }

export function useHybridContext() {
  return React.useContext(Web3Context)
}

export const Web3Context = React.createContext<{
  client: Client
  chains: any[]
  useContext: () => WalletConnectorContext
}>({
  client: undefined,
  chains: undefined,
  useContext: undefined
})

const SUPPORTED_CHAINS = [mainnet, goerli, arbitrum, arbitrumGoerli, localhost]

export function Web3Provider(
  props: {
    children: React.ReactNode
    wallet?: WalletConnector
  } & ProviderKeys
) {
  const {
    children,
    wallet: createWalletConnector = createDefaultWalletConnector
  } = props

  const chains = SUPPORTED_CHAINS
  const providers = buildProviders(props)

  const { client, useContext, Provider } = createWalletConnector({
    chains,
    providers
  })

  const contextValue = {
    client,
    useContext,
    chains
  }

  return (
    <Web3Context.Provider value={contextValue}>
      <WagmiConfig client={client}>
        <Provider>{children}</Provider>
      </WagmiConfig>
    </Web3Context.Provider>
  )
}
