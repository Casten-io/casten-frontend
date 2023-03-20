import { BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

export const parseBalance = (value: BigNumberish, decimalsToDisplay = 3, decimals = 18) =>
  parseFloat(formatUnits(value, decimals)).toFixed(decimalsToDisplay);

export const scanTxLink = (chainId: string | number, txHash: string) => {
  if (Number(chainId) === 80001) {
    return `https://mumbai.polygonscan.com/tx/${txHash}`;
  }
  return `https://polygonscan.com/tx/${txHash}`;
}

export const numberToString = (value: number, minValue = 1000) => {
  if (value < minValue) {
    return Number(value).toLocaleString()
  }
  const suffixes = ['', 'k', 'm', 'b', 't']
  const suffixNum = Math.floor((value.toString().split('.')[0].length - 1) / 3)
  let shortValue: number | string = parseFloat(
    (suffixNum !== 0 ? value / Math.pow(minValue, suffixNum) : value).toPrecision(3)
  )
  if (shortValue % 1 !== 0) {
    shortValue = shortValue.toFixed(1)
  }
  return `${shortValue}${suffixes[suffixNum] || ''}`
}

export function shortenHex(hex: string, length = 4) {
  return `${hex.substring(0, length + 2)}…${hex.substring(hex.length - length)}`
}
