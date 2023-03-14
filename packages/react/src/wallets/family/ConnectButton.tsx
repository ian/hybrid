import { useAccount } from "wagmi"
import { ConnectKitButton } from "connectkit"

export const ConnectButton = () => {
  const { address, isConnecting, isDisconnected } = useAccount()
  if (isConnecting) return <div>Connecting...</div>
  return <ConnectKitButton />
}
