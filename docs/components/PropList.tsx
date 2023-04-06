type Prop = {
	name: string
	type: string
	desc: string
}

const PropList = ({ values }: { values: Prop[] }) => {
	return (
		<table className="w-full text-left">
			<tbody>
				<tr className="border-b-2 border-blue-900 ">
					<td className="p-2">Name</td>
					<td className="p-2">Type</td>
					<td className="p-2">Description</td>
				</tr>
				{values.map((value) => {
					return (
						<tr key={value.name}>
							<th className="p-2 font-mono font-medium text-white">{value.name}</th>
							<td className="p-2">{value.type}</td>
							<td className="p-2">{value.desc}</td>
						</tr>
					)
				})}
			</tbody>
		</table>
	)
}

export default PropList
