import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { CurrencyAmount, JSBI, Rebase, Token, ZERO } from '@sushiswap/core-sdk'
import { Zero } from '@ethersproject/constants'

// export function toAmount(token, shares: BigNumber): BigNumber {
//   // console.log('toAmount', token, shares)
//   return shares.mulDiv(token.bentoAmount, token.bentoShare)
// }

// export function toShare(token, amount: BigNumber): BigNumber {
//   // console.log('toShare', token, shares)
//   return amount.mulDiv(token.bentoShare, token.bentoAmount)
// }

export function toAmount(rebase: Rebase, shares: BigNumber): BigNumber {
  // console.log('toAmount', token, shares)
  if (BigNumber.from(rebase.base.toString()).gt(0)) {
    return shares.mul(BigNumber.from(rebase.elastic.toString())).div(BigNumber.from(rebase.base.toString()));
  }
  return Zero;
}

export function toShare(rebase: Rebase, amount: BigNumber): BigNumber {
  // console.log('toShare', token, shares)
  if (BigNumber.from(rebase.elastic.toString()).gt(0)) {
    return amount.mul(BigNumber.from(rebase.base.toString())).div(BigNumber.from(rebase.elastic.toString()));
  }
  return Zero;
}

export function toAmountJSBI(token: Rebase, shares: JSBI): JSBI {
  return JSBI.GT(token.base, 0) ? JSBI.divide(JSBI.multiply(shares, token.elastic), token.base) : ZERO
}

export function toShareJSBI(token: Rebase, amount: JSBI): JSBI {
  return JSBI.GT(token.elastic, 0) ? JSBI.divide(JSBI.multiply(amount, token.base), token.elastic) : ZERO
}

export function toAmountCurrencyAmount(token: Rebase, shares: CurrencyAmount<Token>) {
  const amount = toAmountJSBI(token, shares.quotient)
  return CurrencyAmount.fromRawAmount(shares.currency, amount)
}

export function toShareCurrencyAmount(token: Rebase, amount: CurrencyAmount<Token>) {
  const share = toShareJSBI(token, amount.quotient)
  return CurrencyAmount.fromRawAmount(amount.currency, share)
}

