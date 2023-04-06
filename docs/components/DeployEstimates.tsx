import { chainName } from "hybrid"
import { useEstimation } from "~/hooks/useEstimation"

type Props = {
	chainId: number
	estimate: ReturnType<typeof useEstimation>
}

export default function DeployEstimates({ chainId, estimate }: Props) {
	return (
		<div className="space-y-3">
			<div className="flex items-start justify-between">
				<label>Blockchain</label>
				<div>
					<p>{chainName(chainId)}</p>
				</div>
			</div>
			<div className="flex items-start justify-between">
				<dt className="text-base">
					<p>Deploy Estimate</p>
				</dt>
				<dd className="flex flex-col items-end space-y-1 font-medium text-gray">
					<p className="text-green">{estimate?.eth?.toFixed(5)}E</p>
					<span className="flex items-center font-serif text-black dark:text-white"></span>
				</dd>
			</div>
		</div>
	)
}
