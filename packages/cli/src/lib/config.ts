import fs from "fs"
import { CompiledContract, DeployTarget, Deployment } from "../types"

export const readConfig = (target: DeployTarget) => {
  try {
    return JSON.parse(
      fs.readFileSync(process.cwd() + "/.hybrid/" + target + ".json").toString()
    )
  } catch {
    return {}
  }
}

export const writeConfig = async (
  target: DeployTarget,
  chainId: number,
  contractName: string,
  deployment: Deployment,
  contract: CompiledContract
) => {
  // Load the existing config
  const json = await readConfig(target)

  // Rewrite the config, overwriting the newly deployed contract
  await fs.writeFileSync(
    process.cwd() + "/.hybrid/" + target + ".json",
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
