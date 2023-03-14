import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

export const ConnectButton = () => {
  const { isConnecting } = useAccount()
  if (isConnecting) return <div>Connecting...</div>
  return <RainbowConnectButton />
}
