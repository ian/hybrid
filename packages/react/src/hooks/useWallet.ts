import { useHybridContext } from "../providers/Web3Provider"
import type { UseWallet } from "@hybrd/types"

export type UseWalletProps = { chainId?: number }

export function useWallet(props?: UseWalletProps): UseWallet {
  const { chainId } = props || {}

  const { hooks } = useHybridContext()
  const wallet = hooks.useWallet()

  // const [context, setContext] = React.useState<UseWallet>({
  //   connect: () => {},
  // })

  // console.log({ useHybridContext })
  // console.log({ hooks })

  // Some of the wallet provideers don't like to be loaded on the server.
  // So we only create the context on the client.
  // React.useEffect(() => {
  //   setContext(context)
  // }, [hooks.useWallet, chainId])

  return wallet
}
