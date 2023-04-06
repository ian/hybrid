// Runtime client library for Hybrid apps

let target

if (process.env.NODE_ENV === "production") {
	// in prod, use HYBRID_ENV or default to prod
	if (
		process.env.HYBRID_ENV === "test" ||
		process.env.NEXT_PUBLIC_HYBRID_ENV === "test"
	) {
		target = "test"
	} else {
		target = "prod"
	}
} else {
	// allow HYBRID_ENV to override dev
	target = process.env.HYBRID_ENV || process.env.NEXT_PUBLIC_HYBRID_ENV || "dev"
}

type DeployedContract = {
	address: string
	chainId: number
	txHash: string
	blockHash: string
	blockNumber: number
	abi: any[]
	bytecode: string
}

let contents = {}

try {
	if (target === "dev") {
		contents = require("./cache/dev.json")
	} else {
		contents = require("./" + target + ".json")
	}
} catch (err) {
	console.log("Error loading deployments for target " + target)
	console.error(err)
}

export const Deployments: Record<string, DeployedContract> = contents
