import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { buildProviders } from "./helpers"

import { Chain, configureChains, createClient, WagmiConfig } from "wagmi"
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains"

import React, { useMemo } from "react"

type Config = {
  appName?: string
  chains?: Chain[]
  alchemyKey?: string
  infuraKey?: string

  // Deprecated
  address: string
  chainId: number
}

export const Context = React.createContext<{
  address: string
  chainId: number
}>({
  address: undefined,
  chainId: undefined
})

export const Web3Provider = (props: { children: React.ReactNode } & Config) => {
  const { appName, children, address, chainId, ...keys } = props

  const { chains, provider, webSocketProvider } = useMemo(() => {
    const providers = buildProviders(keys)
    const { chains, provider, webSocketProvider } = configureChains(
      props.chains || [mainnet, polygon, optimism, arbitrum],
      providers
    )
    return { chains, provider, webSocketProvider }
  }, [keys])

  const value = {
    address,
    chainId
  }

  const { connectors } = getDefaultWallets({
    appName: appName || "Hybrid App",
    chains
  })

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
    webSocketProvider
  })

  return (
    <Context.Provider value={value}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
      </WagmiConfig>
    </Context.Provider>
  )
}
