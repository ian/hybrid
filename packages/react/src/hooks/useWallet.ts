import { useWeb3 } from "../providers/Web3Provider"
import type { UseWallet } from "@hybrd/types"

export function useWallet(): UseWallet {
  const { hooks } = useWeb3()
  const { connect, disconnect } = hooks.useWallet()

  return {
    connect,
    disconnect,
  }
}
