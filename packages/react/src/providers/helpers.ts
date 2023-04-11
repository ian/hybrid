import { alchemyProvider } from "wagmi/providers/alchemy"
import { infuraProvider } from "wagmi/providers/infura"
import { publicProvider } from "wagmi/providers/public"
import type { ProviderKeys } from "@hybrd/types"
import { hybridProvider } from "./hybridProvider"

export function buildProviders(config: ProviderKeys) {
  const { alchemyKey, infuraKey, hybridKey } = config
  const providers = []

  if (alchemyKey) {
    providers.push(
      alchemyProvider({
        apiKey: alchemyKey,
      })
    )
  }

  if (infuraKey) {
    providers.push(
      infuraProvider({
        apiKey: infuraKey,
      })
    )
  }

  providers.push(
    hybridProvider({
      apiKey: hybridKey,
    })
  )

  providers.push(publicProvider())

  return providers
}
