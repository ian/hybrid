import { useWallet } from "hybrid"
import Button from "~/components/Button"
import Demo from "~/components/Demo"
import { ConnectKit } from "hybrid-connectkit"

const MagicLinkButton = () => {
	const { connect } = useWallet()
	console.log(connect)
	return (
		<Button
			onClick={
				() => connect()
				// console.log
			}
		>
			Connect Wallet
		</Button>
	)
}

export default function MagicLinkDemo() {
	const wallet = ConnectKit({
		// apiKey: process.env.NEXT_PUBLIC_MAGIC_LINK_KEY as string
		appName: "Hybrid Docs"
	})

	return (
		<Demo wallet={wallet}>
			<MagicLinkButton />
		</Demo>
	)
}
