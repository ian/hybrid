import { MintButton } from "hybrid"
import { Deployments } from "~/.hybrid/client"

import Demo from "~/components/Demo"

const MintButtonDemo = () => {
	return (
		<Demo>
			<MintButton contract={Deployments.NFT} />
		</Demo>
	)
}

export default MintButtonDemo
