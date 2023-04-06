import { useProvider } from "wagmi"
import { useEffect, useState } from "react"

/**
 * The wagmi useEnsName does not respect the chainId property.
 */
export function useEnsName(address: `0x${string}`) {
  const [ens, setENS] = useState<string | null>()
  const provider = useProvider({ chainId: 1 })

  useEffect(() => {
    if (!address) return
    provider.lookupAddress(address).then(setENS)
  }, [address, provider])

  return ens
}
