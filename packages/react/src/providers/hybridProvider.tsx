import { providers } from "ethers"

import type { Chain, ChainProviderFn } from "wagmi"
// import { FallbackProviderConfig } from "@ethersproject/providers"

export type HybridProviderConfig = {
  /** Your Hybrid API key from the [Hybrid Dashboard](https://hybrid.dev/dashboard). */
  apiKey: string
}

export function hybridProvider<TChain extends Chain = Chain>({
  apiKey,
}: HybridProviderConfig): ChainProviderFn<
  TChain,
  providers.JsonRpcProvider,
  providers.WebSocketProvider
> {
  return function (chain) {
    const [http, ws] = getURLs(chain)

    return {
      chain: {
        ...chain,
        rpcUrls: {
          default: { http: [http], ws: [ws] },
        },
      } as TChain,
      provider: () => new providers.JsonRpcProvider(http + apiKey),
      webSocketProvider: () => new providers.WebSocketProvider(ws),
    }
  }
}

const getURLs = (chain: Chain): [`https://${string}`, `wss://${string}`] => {
  switch (chain.id) {
    case 1:
      return [
        "https://eth-mainnet.rpc.hybrid.dev/",
        "wss://eth-mainnet.rpc.hybrid.dev/",
      ]
    case 5:
      return [
        "https://eth-goerli.rpc.hybrid.dev/",
        "wss://eth-goerli.rpc.hybrid.dev/",
      ]
    case 137:
      return [
        "https://polygon.rpc.hybrid.dev/",
        "wss://polygon.rpc.hybrid.dev/",
      ]
    case 80001:
      return [
        "https://polygon-mumbai.rpc.hybrid.dev/",
        "wss://polygon-mumbai.rpc.hybrid.dev/",
      ]
    case 10:
      return [
        "https://optimism.rpc.hybrid.dev/",
        "wss://optimism.rpc.hybrid.dev/",
      ]
    case 420:
      return [
        "https://optimism-goerli.rpc.hybrid.dev/",
        "wss://optimism-goerli.rpc.hybrid.dev/",
      ]
    case 42161:
      return [
        "https://arbitrum.rpc.hybrid.dev/",
        "wss://arbitrum.rpc.hybrid.dev/",
      ]
    case 421613:
      return [
        "https://arbitrum-goerli.rpc.hybrid.dev/",
        "wss://arbitrum-goerli.rpc.hybrid.dev/",
      ]
    case 8453:
      throw new Error("Base Mainnet has not been released yet.")
    case 84531:
      return [
        "https://base-goerli.rpc.hybrid.dev/",
        "wss://base-goerli.rpc.hybrid.dev/",
      ]

    default:
      throw new Error(`Chain ${chain.id} is not supported.`)
  }
}
