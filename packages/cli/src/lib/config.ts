import fs from "fs"
import { CompiledContract, DeployTarget, Deployment } from "@hybrd/types"

export const readConfig = () => {
  try {
    return JSON.parse(
      fs.readFileSync(process.cwd() + "/hybrid.config.js").toString()
    )
  } catch {
    return {}
  }
}

export const readDeployment = (target: DeployTarget | "dev") => {
  const file = target === "dev" ? "cache/dev.json" : target + ".json"
  try {
    return JSON.parse(
      fs.readFileSync(process.cwd() + "/.hybrid/" + file).toString()
    )
  } catch {
    return {}
  }
}

export const writeDeployment = async (
  target: DeployTarget | "dev",
  chainId: number,
  contractName: string,
  deployment: Deployment,
  contract: CompiledContract
) => {
  const file = target === "dev" ? "cache/dev.json" : target + ".json"

  // Load the existing config
  const json = await readDeployment(target)

  // Rewrite the config, overwriting the newly deployed contract
  return fs.writeFileSync(
    process.cwd() + "/.hybrid/" + file,
    JSON.stringify(
      {
        ...json,
        [contractName]: {
          chainId: chainId,
          ...deployment,
          abi: contract.abi,
          bytecode: contract.bytecode,
        },
      },
      null,
      2
    )
  )
}

export const templates = {
  "hybrid.config.js": (chain) => {
    return `
module.exports = {
  chain: "${chain}",
}
    `
    // foundry: "./foundry.toml",
    // anvil: {
    //   chainId: 1337,
    //   blockTime: 10,
    //   baseFee: 0
    // }
  },
  "foundry.toml": `# See more config options https://github.com/foundry-rs/foundry/tree/master/config

[profile.default]
src = './contracts'
test = './contracts'
cache = true
cache_path = '.hybrid/cache'
out = '.hybrid/out'
libs = ["node_modules"]
gas_reports = ["*"]`,
  ".gitignore": `cache
out
`,
  "README.md": `# Hybrid Production Runtime

Make sure to commit this directory to your repository. It contains
the compiled contracts and the deployment information.

### .gitignore

There's a gitignore file in here, don't commit the following directories:

- cache
- out
`,
  "package.json": `{
	"name": ".hybrid/client",
	"main": "client.js",
	"types": "client.d.ts"
}`,
  "client.d.ts": `import type { DeployedContract } from "hybrid";
export declare const Deployments: Record<string, DeployedContract>;
`,
  "client.js": `// Runtime client library for Hybrid apps

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

export const Deployments = contents
`,
}
