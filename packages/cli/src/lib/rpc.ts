import { Wallet } from "ethers"
import { http, createWalletClient, getAccount } from "viem"

export async function deployContract({
  privateKey,
  abi,
  bytecode
}: {
  privateKey: `0x${string}`
  abi: any
  bytecode: `0x${string}`
}) {
  const wallet = new Wallet(privateKey)
  const account = getAccount(wallet.address as `0x${string}`)
  const client = createWalletClient({
    key: privateKey,
    transport: http("http://127.0.0.1:8545")
  })
  client.deployContract({
    account,
    abi,
    args: [],
    bytecode
  })
}
