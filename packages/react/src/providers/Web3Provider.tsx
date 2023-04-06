import { WagmiConfig, Client, Chain } from "wagmi"

import React from "react"
import {
  ProviderKeys,
  WalletConnector,
  WalletConnectionHooks,
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
  chains: Chain[]
  hooks: WalletConnectionHooks
}>({
  client: undefined,
  chains: undefined,
  hooks: undefined,
})

export function Web3Provider(
  props: {
    children: React.ReactNode
    chains?: Chain[]
    wallet?: WalletConnector
  } & ProviderKeys
) {
  const {
    children,
    chains,
    wallet: createWalletConnector = createDefaultWalletConnector,
  } = props

  const providers = buildProviders(props)
  const { client, hooks, Provider } = createWalletConnector({
    chains,
    providers,
  })

  const contextValue = {
    client,
    hooks,
    chains,
  }

  return (
    <Web3Context.Provider value={contextValue}>
      <WagmiConfig client={client}>
        <Provider>{children}</Provider>
      </WagmiConfig>
    </Web3Context.Provider>
  )
}
