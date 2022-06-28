import { ethers } from "ethers";
import { BigNumber } from '@ethersproject/bignumber'
import { Signature } from '@ethersproject/bytes'
import { TransactionResponse } from '@ethersproject/providers'
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Currency, CurrencyAmount } from '@sushiswap/core-sdk'
import { useCallback } from 'react'
import { getAddresses } from "src/constants";
import { KashiMediumRiskLendingPair } from "../kashi/KashiLendingPair";
import KashiCooker from "../kashi/kashiCooker";

export const ZERO = BigNumber.from('0')

export async function borrowAssetExecute(
    {pair, collateralAmount, borrowAmount, permit, provider, chainId, account}: 
    {
        pair: KashiMediumRiskLendingPair
        collateralAmount: CurrencyAmount<Currency>
        borrowAmount: CurrencyAmount<Currency>
        permit?: Signature
        provider: JsonRpcProvider | StaticJsonRpcProvider
        chainId: number
        account: string
    }
): Promise<TransactionResponse | undefined> {
    const cooker = new KashiCooker(pair, account, provider, chainId)
    const masterContract: string = getAddresses(chainId).KASHI_PAIR_ADDRESS

    // Add permit if available
    if (permit) {
        cooker.approve({
          account,
          masterContract,
          v: permit.v,
          r: permit.r,
          s: permit.s,
        })
    }

    if (borrowAmount) {
        // Always update exchange rate
        cooker.updateExchangeRate(true, ZERO, ZERO)

        // Add borrow action
        cooker.borrow(
            BigNumber.from(borrowAmount.quotient.toString()),
            false,  // toBento
            ''
        )
    }

    if (collateralAmount) {
        // Add collateral action
        cooker.addCollateral(
          BigNumber.from(collateralAmount.quotient.toString()),
          false  // fromBento
        )
    }

    const result = await cooker.cook()

    if (result.success) {
        return result.tx
    }
}
