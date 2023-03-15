import { Abi } from "abitype"

// import { Chain } from "wagmi"
// import type { TransactionResponse } from "@ethersproject/providers"
// import type { ContractInterface, ContractReceipt } from "ethers"

export type Contract = {
  abi: Abi
  bytecode: string
}

// export type HybridConfig = {
//   debug?: boolean
//   address?: `0x${string}`
//   chain: Chain
//   lists?: string[]
//   signatures?: SignatureTree
// }

// export type Drop = {
//   id: string

//   title: string
//   description: string
//   maxSupply: number

//   banner: string
//   logo: string

//   address: string
//   chainId: number
//   abi: ContractInterface

//   lists: { name: string; signer: string }[]

//   // @deprecated
//   groups: (Omit<AllowList, "exists"> & { name: string })[]

//   mintPrice: number
//   maxPerWallet: number

//   startTime: number
//   startsAt: Date
//   endTime: number
//   endsAt: Date
// }

// export type Counts = {
//   maxSupply: number
//   totalSupply: number
//   remaining: number
// }

// export type Signature = {
//   s: string
//   n: number
// }

// export type SignatureWithSigner = {
//   x: string
// } & Signature

// export type SignatureTree = {
//   [hashed: string]: Signature
// }

// export type MintConfig = {
//   mintPrice: number
//   startTime: Date | false
//   endTime: Date | false
// }

// export type AllowList = {
//   exists: boolean
//   mintCount: number
//   mintPrice: number
//   maxPerWallet: number
//   startTime: Date
//   endTime: Date
// }

// export type MintingEventHandlers = {
//   onTransaction?: (res: TransactionResponse) => void
//   onReceipt?: (receipt: ContractReceipt) => void
//   onSuccess?: (nfts: MintedNFTs) => void
//   onError?: (err: Error) => void
// }

// export type MintedNFTs = {
//   owner: string
//   tokenId: string
// }[]

// export type MintResponse = {
//   receipt: ContractReceipt
//   nfts: MintedNFTs
// }
