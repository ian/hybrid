import Demo from "~/components/Demo"
import { ConnectKit } from "hybrid-connectkit"
import { ConnectKitButton } from "connectkit"

const Example = () => {
	return <ConnectKitButton />
}

export default function ConnectKitDemo() {
	const wallet = ConnectKit({
		appName: "Hybrid Docs"
	})

	return (
		<Demo wallet={wallet}>
			<Example />
		</Demo>
	)
}
