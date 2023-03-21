import { configureChains, createClient, WagmiConfig, Client } from "wagmi"
import {
  mainnet,
  goerli,
  localhost,
  arbitrum,
  arbitrumGoerli
} from "wagmi/chains"

import { alchemyProvider } from "wagmi/providers/alchemy"
import { infuraProvider } from "wagmi/providers/infura"
import { publicProvider } from "wagmi/providers/public"

import React, { useContext, useMemo } from "react"
import { Provider } from "@ethersproject/providers"

type Config = {
  appName?: string
  alchemyKey?: string
  infuraKey?: string
  publicProvider?: boolean
}

export const withHybrid = (InputComponent, config: Config = {}) => {
  return function WithHybrid(props) {
    return (
      <Web3Provider {...config}>
        <InputComponent {...props} />
      </Web3Provider>
    )
  }
}

export function useHybrid() {
  return useContext(Web3Context)
}

export const Web3Context = React.createContext<{
  client: Client
  chains: any[]
  provider: ({ chainId }: { chainId?: number }) => Provider
  webSocketProvider: ({ chainId }: { chainId?: number }) => Provider
}>({
  client: undefined,
  chains: undefined,
  provider: undefined,
  webSocketProvider: undefined
})

const SUPPORTED_CHAINS = [mainnet, goerli, arbitrum, arbitrumGoerli, localhost]

export function Web3Provider(props: { children: React.ReactNode } & Config) {
  const { appName, children, ...keys } = props

  const { chains, provider, webSocketProvider } = useMemo(() => {
    const { chains, provider, webSocketProvider } = configureChains(
      SUPPORTED_CHAINS,
      buildProviders(keys)
    )
    return { chains, provider, webSocketProvider }
  }, [keys])

  const client = createClient({
    autoConnect: true,
    // connectors,
    provider,
    webSocketProvider
  })

  const contextValue = {
    client,
    chains,
    provider,
    webSocketProvider
  }

  return (
    <Web3Context.Provider value={contextValue}>
      <WagmiConfig client={client}>{children}</WagmiConfig>
    </Web3Context.Provider>
  )
}

function buildProviders(config: Config) {
  const { alchemyKey, infuraKey, publicProvider: usePublic = true } = config
  const providers = []

  if (alchemyKey) {
    providers.push(
      alchemyProvider({
        apiKey: alchemyKey
      })
    )
  }

  if (infuraKey) {
    providers.push(
      infuraProvider({
        apiKey: infuraKey
      })
    )
  }

  if (usePublic) {
    providers.push(publicProvider())
  }

  return providers
}
