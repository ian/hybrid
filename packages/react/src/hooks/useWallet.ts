import { useHybridContext } from "../providers/Web3Provider"

type UseWallet = {
  connect: () => void
}

export function useWallet(): UseWallet {
  const { useContext } = useHybridContext()
  const { connect } = useContext()

  return {
    connect,
  }
}
