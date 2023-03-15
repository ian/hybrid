import { getDefaultWallets } from "@rainbow-me/rainbowkit"
import { buildProviders } from "./helpers"

import { configureChains, createClient, WagmiConfig } from "wagmi"
import * as Chains from "wagmi/chains"

import React, { useMemo } from "react"

type Config = {
  appName?: string
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
    const chain = Object.values(Chains).find((chain) => chain.id === chainId)
    const providers = buildProviders(keys)
    const { chains, provider, webSocketProvider } = configureChains(
      [chain],
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
        {/* <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider> */}
        {children}
      </WagmiConfig>
    </Context.Provider>
  )
}
