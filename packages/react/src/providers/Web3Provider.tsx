import { WagmiConfig, Client, Chain, mainnet, goerli } from "wagmi"

import React from "react"
import {
  ProviderConfig,
  WalletConnector,
  WalletConnectionHooks,
} from "@hybrd/types"

import createDefaultWalletConnector from "./DefaultWalletConnector"
import { publicProvider } from "wagmi/providers/public"
import { hybridProvider } from "./hybridProvider"

export function useWeb3() {
  return React.useContext(Web3Context)
}

export const Web3Context = React.createContext<{
  client: Client
  chains: Chain[]
  hooks: WalletConnectionHooks
}>({
  client: undefined,
  chains: undefined,
  hooks: {
    useWallet: () => ({
      connect: () => {
        console.error("No wallet provider found")
      },
      disconnect: () => {
        console.error("No wallet provider found")
      },
    }),
  },
})

function buildProviders(config: ProviderConfig) {
  const { hybridKey } = config
  const providers = []

  providers.push(
    hybridProvider({
      apiKey: hybridKey,
    })
  )

  providers.push(publicProvider())

  return providers
}

export function Web3Provider(
  props: {
    children: React.ReactNode
    chains?: Chain[]
    wallet?: WalletConnector
  } & ProviderConfig
) {
  const {
    children,
    chains = [mainnet, goerli],
    wallet: createWalletConnector = createDefaultWalletConnector,
  } = props

  const { client, hooks, Provider } = createWalletConnector({
    chains,
    providers: buildProviders(props),
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

// I really want to support an HOC its cleaner in some cases.
//
// export const withHybrid = (InputComponent, config: Config = {}) => {
//   return function WithHybrid(props) {
//     return (
//       <Web3Provider {...config}>
//         <InputComponent {...props} />
//       </Web3Provider>
//     )
//   }
// }
