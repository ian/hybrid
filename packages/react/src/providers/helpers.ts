import { alchemyProvider } from "wagmi/providers/alchemy"
import { infuraProvider } from "wagmi/providers/infura"
import { publicProvider } from "wagmi/providers/public"
import type { ProviderKeys } from "@hybrd/types"

export function buildProviders(config: ProviderKeys) {
  const { alchemyKey, infuraKey } = config
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

  // TODO - add hybrid provider
  // providers.push(hybridProvider())

  providers.push(publicProvider())

  return providers
}
