// Helpful ethers.js links:
// https://docs.ethers.io/v5/api/signer/#Signer-signMessage%5Bethers%5D
// https://docs.ethers.io/v5/api/utils/hashing/#utils-hashMessage

// If/when we want to add web3.js support
// https://web3js.readthedocs.io/en/v1.3.4/web3-eth-accounts.html#sign%5BWeb3.js%5D

// the secret to getting this working was this post: https://blog.cabala.co/how-to-verify-off-chain-results-and-whitelist-with-ecdsa-in-solidity-using-openzeppelin-ethers-js-ba4c85521711

import { Signer, Wallet, utils } from "ethers"
import type { SignatureWithSigner } from "../types"

export async function createSignature(
  key,
  address,
  nonce
): Promise<SignatureWithSigner> {
  const wallet = new Wallet(key)
  const msg = createMessage(address, nonce)
  const s = await sign(wallet, msg)

  return {
    s,
    n: nonce,
    x: wallet.address
  }
}

/**
 * Pack the address and generate and nonce together and hash them
 * @param payload address
 * @returns hash
 */
export function createMessage(address: string, nonce: number) {
  const hash = utils.solidityKeccak256(
    ["address", "uint256"],
    [utils.getAddress(address), nonce]
  )

  return utils.arrayify(hash)
}

export async function sign(signer: Signer, message: Uint8Array) {
  return signer.signMessage(utils.arrayify(message))
}

export function recoverAddress(signature: string, message: Uint8Array) {
  return utils.verifyMessage(message, signature)
}
