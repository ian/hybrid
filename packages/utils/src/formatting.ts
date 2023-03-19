export function truncateEthAddress(address: string | undefined) {
  if (!address) return null
  return address.slice(0, 6) + "…" + address.slice(38, 42)
}
