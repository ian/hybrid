import { useDisconnect } from "wagmi"
import { useWeb3 } from "../providers/Web3Provider"
import type { UseWallet } from "@hybrd/types"

export function useWallet(): UseWallet {
  const { hooks } = useWeb3()
  const { connect } = hooks.useWallet()
  const { disconnect } = useDisconnect()

  return {
    connect,
    disconnect,
  }
}
