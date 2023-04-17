import { providers } from "ethers"

import type { Chain, ChainProviderFn } from "wagmi"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"

export type HybridProviderConfig = {
  apiKey: string
}

export function hybridProvider<TChain extends Chain = Chain>({
  apiKey,
}: HybridProviderConfig): ChainProviderFn<
  TChain,
  providers.JsonRpcProvider,
  providers.WebSocketProvider
> {
  return jsonRpcProvider({
    rpc: (chain) => {
      const chainName = chain?.network || "mainnet"
      const http = `https://rpc.hybrid.dev/${chainName}/${apiKey || ""}`
      const webSocket = `wss://rpc.hybrid.dev/${chainName}/${apiKey || ""}`

      return {
        http,
        webSocket,
      }
    },
  })
}
