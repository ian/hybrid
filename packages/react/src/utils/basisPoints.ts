export function bipsToPercent(bp: number | string) {
  if (typeof bp !== "number") return null
  return parseInt(bp.toString()) / 100
}

export function percentToBips(percent: number) {
  return percent * 100
}

export function bipsToDecimal(bp: number | string) {
  if (typeof bp !== "number") return 0
  return parseInt(bp.toString()) / 10000
}
