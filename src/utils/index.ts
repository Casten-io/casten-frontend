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
