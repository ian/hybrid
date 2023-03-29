import { WagmiConfig, Client } from "wagmi"
import {
  mainnet,
  goerli,
  localhost,
  arbitrum,
  arbitrumGoerli
} from "wagmi/chains"

import React, { useContext, useMemo } from "react"
// import { Provider } from "@ethersproject/providers"
import { ProviderKeys, WalletConnector } from "@hybrd/types"
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

export function useHybrid() {
  return useContext(Web3Context)
}

export const Web3Context = React.createContext<{
  client: Client
  chains: any[]
  // provider: ({ chainId }: { chainId?: number }) => Provider
  // webSocketProvider: ({ chainId }: { chainId?: number }) => Provider
}>({
  client: undefined,
  chains: undefined
  // provider: undefined,
  // webSocketProvider: undefined
})

const SUPPORTED_CHAINS = [mainnet, goerli, arbitrum, arbitrumGoerli, localhost]

export function Web3Provider(
  props: {
    children: React.ReactNode
    wallet: WalletConnector
  } & ProviderKeys
) {
  console.log({ props })

  const {
    children,
    wallet: createWalletConnector = createDefaultWalletConnector
  } = props
  const chains = SUPPORTED_CHAINS
  const providers = buildProviders(props)

  const { client, Provider } = createWalletConnector({
    chains,
    providers
  })

  const contextValue = {
    client,
    chains
    // provider,
    // webSocketProvider
  }

  return (
    <Web3Context.Provider value={contextValue}>
      <WagmiConfig client={client}>
        <Provider>{children}</Provider>
      </WagmiConfig>
    </Web3Context.Provider>
  )
}
