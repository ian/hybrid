import { buildProviders } from "./helpers"

import { Chain, configureChains } from "wagmi"
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains"

import { Provider as ConnectKitProvider } from "../wallets/family/Provider"
import { Provider as RainbowKitProvider } from "../wallets/rainbow/Provider"
import React, { useMemo } from "react"

type Wallet = "connectkit" | "rainbowkit"
type Config = {
  address: string
  chainId: number
  chains?: Chain[]
  wallet: Wallet
  alchemyKey?: string
  infuraKey?: string
}

export const Context = React.createContext<{
  address: string
  chainId: number
}>({
  address: undefined,
  chainId: undefined
})

export const Web3Provider = (props: { children: React.ReactNode } & Config) => {
  const { children, wallet, address, chainId, ...keys } = props

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

  if (wallet === "connectkit") {
    return (
      <Context.Provider value={value}>
        <ConnectKitProvider
          chains={chains}
          provider={provider}
          webSocketProvider={webSocketProvider}
        >
          {children}
        </ConnectKitProvider>
      </Context.Provider>
    )
  }

  if (wallet === "rainbowkit") {
    return (
      <Context.Provider value={value}>
        <RainbowKitProvider
          chains={chains}
          provider={provider}
          webSocketProvider={webSocketProvider}
        >
          {children}
        </RainbowKitProvider>
      </Context.Provider>
    )
  }

  return <span>Unknown wallet type &quot;{wallet}&quot;</span>
}
