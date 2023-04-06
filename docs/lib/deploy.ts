import { ContractFactory } from "ethers"

export function getDeployData(
	abi: any,
	bytecode: string,
	signer: any,
	args: any[]
): string {
	const factory = new ContractFactory(abi, bytecode, signer)
	try {
		const tx = factory.getDeployTransaction(...args)
		if (tx?.data) return tx.data as string
		throw new Error("Problem occurred during deployData generation.")
	} catch (err) {
		console.error(err)
		throw err
	}
}
