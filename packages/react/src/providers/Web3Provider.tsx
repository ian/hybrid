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
import { WalletConnector } from "@hybrd/types"
import createDefaultWalletConnector from "./DefaultWalletConnector"

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

export function Web3Provider(props: {
  children: React.ReactNode
  wallet: WalletConnector
}) {
  console.log({ props })

  const { children, wallet: createDefaultWalletConnector } = props
  const chains = SUPPORTED_CHAINS

  // const { chains, provider, webSocketProvider } = useMemo(() => {
  //   const { chains, provider, webSocketProvider } = configureChains(
  //     SUPPORTED_CHAINS,
  //     buildProviders(keys)
  //   )
  //   return { chains, provider, webSocketProvider }
  // }, [keys])

  const { client, Provider } = createDefaultWalletConnector({
    chains
  })

  // const { client, Provider } = useMemo(
  //   () =>
  //     createDefaultWalletConnector({
  //       chains
  //     }),
  //   []
  // )

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
