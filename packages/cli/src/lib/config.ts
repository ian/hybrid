import fs from "fs"
import { CompiledContract, DeployTarget, Deployment } from "@hybrd/types"

export const readConfig = (target: DeployTarget | "dev") => {
  const file = target === "dev" ? "cache/dev.json" : target + ".json"
  try {
    return JSON.parse(
      fs.readFileSync(process.cwd() + "/.hybrid/" + file).toString()
    )
  } catch {
    return {}
  }
}

export const writeConfig = async (
  target: DeployTarget | "dev",
  chainId: number,
  contractName: string,
  deployment: Deployment,
  contract: CompiledContract
) => {
  const file = target === "dev" ? "cache/dev.json" : target + ".json"

  // Load the existing config
  const json = await readConfig(target)

  // Rewrite the config, overwriting the newly deployed contract
  await fs.writeFileSync(
    process.cwd() + "/.hybrid/" + file,
    JSON.stringify(
      {
        ...json,
        [contractName]: {
          chainId: chainId,
          abi: contract.abi,
          bytecode: contract.bytecode,
          ...deployment
        }
      },
      null,
      2
    )
  )
}
