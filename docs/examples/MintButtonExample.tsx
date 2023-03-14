import { ABI } from "~/.hybrid"
import { MintButton } from "hybrid"

import Example from "~/components/Example"

const MintButtonExample = () => {
	return (
		<Example>
			<MintButton
				abi={ABI.MyNFT}
				// className="px-8 py-3 text-white transition-all bg-blue-500 cursor-pointer hover:bg-opacity-95 duration-250 hover:scale-[1.05] rounded-xl font-bold"
			/>
		</Example>
	)
}

export default MintButtonExample
