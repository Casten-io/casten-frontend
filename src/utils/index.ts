import { BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

export const parseBalance = (value: BigNumberish, decimalsToDisplay = 3, decimals = 18) =>
  parseFloat(formatUnits(value, decimals)).toFixed(decimalsToDisplay);
