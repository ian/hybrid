import { etherscanAddressURL, truncateEthAddress } from "@hybrd/utils"
import clsx from "clsx"
import { useEnsName } from "../hooks/internal"
import { useAccount, useNetwork } from "wagmi"
import { useWallet } from "../hooks"

export default function ConnectedAs(props: {
  className?: string
  chainId?: number
}) {
  const { className, chainId } = props
  const { address, isConnected } = useAccount()
  const { connect } = useWallet()
  const { chain: network } = useNetwork()
  const ens = useEnsName(address)

  return (
    <p className={clsx(className, "flex space-x-3 items-center justify-cente")}>
      {!isConnected && (
        <button onClick={() => connect()}>Connect Wallet</button>
      )}

      {isConnected && (
        <span className="">
          connected as{" "}
          <a
            href={etherscanAddressURL(address, chainId || network.id)}
            className={clsx(className, "underline")}
            target="_blank"
            rel="noreferrer"
          >
            {ens || truncateEthAddress(address as string)}
          </a>
        </span>
      )}
    </p>
  )
}
