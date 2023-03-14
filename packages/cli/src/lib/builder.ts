import fs from "fs"

// import { Abi } from "abitype";

// export const ABI = {
//   MyNFT: require("./out/MyNFT.sol/MyNFT.json").abi as Abi,
// };

export const writeConfig = async () => {
  const contracts = await listContracts(process.cwd() + "/contracts")

  const abis = contracts.reduce((acc, filename: string) => {
    const name = filename.replace(".sol", "")
    acc[name] = `require("./out/${name}.sol/${name}.json").abi as Abi`
    return acc
  }, {})

  return fs.writeFileSync(
    process.cwd() + "/.hybrid/index.ts",
    `
import { Abi } from "abitype";

export const ABI = {
  ${Object.keys(abis)
    .map((name) => `${name}: ${abis[name]}`)
    .join(",\n  ")}
};
  `
  )
}

const listContracts = async (dir) => {
  const files = await fs.readdirSync(dir)
  return files.filter((f) => !f.match(/(t|test)\.sol$/))
}
