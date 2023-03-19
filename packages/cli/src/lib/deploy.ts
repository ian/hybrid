import { Abi } from "abitype"
import { ContractFactory, Wallet } from "ethers"
import { Transaction, Receipt } from "@hybrd/types"

export async function deploy(
  abi: Abi,
  bytecode: string,
  args: any[],
  signer: Wallet,
  opts?: {
    onTx?: (tx: Transaction) => void
    onReceipt?: (receipt: Receipt) => void
  }
) {
  const deployData = await getDeployData(abi, bytecode, signer, args)

  const tx = {
    from: signer.address,
    data: deployData
  }

  return signer
    ?.sendTransaction(tx)
    .then((tx: Transaction) => {
      opts?.onTx?.(tx)
      return tx.wait()
    })
    .then((receipt: Receipt) => {
      opts?.onReceipt?.(receipt)
    })
    .catch((err: Error) => console.error(err))
}

export async function getDeployData(
  abi: any,
  bytecode: string,
  signer: any,
  args: any[]
): Promise<string> {
  const factory = new ContractFactory(abi, bytecode, signer)

  try {
    const tx = await factory.getDeployTransaction(...args)
    if (tx?.data) return tx.data as string
    throw new Error("Problem occurred during deployData generation.")
  } catch (err) {
    console.error(err)
    throw err
  }
}
