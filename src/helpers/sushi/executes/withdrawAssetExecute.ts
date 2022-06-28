import { ethers } from "ethers";
import { BigNumber } from '@ethersproject/bignumber'
import { Signature } from '@ethersproject/bytes'
import { TransactionResponse } from '@ethersproject/providers'
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Currency, CurrencyAmount, JSBI, Rebase } from '@sushiswap/core-sdk'
import { useCallback } from 'react'
import { getAddresses } from "src/constants";
import { minimum } from "../lib/math";
import { toShare } from "../lib/bentoBox";
import { KashiMediumRiskLendingPair } from "../kashi/KashiLendingPair";
import KashiCooker from "../kashi/kashiCooker";

export async function withdrawAssetExecute(
    {pair, withdrawAmount, removeMax, permit, provider, chainId, account}: 
    {
        pair: KashiMediumRiskLendingPair
        withdrawAmount: CurrencyAmount<Currency>
        removeMax: boolean
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

    const fraction = removeMax
    ? minimum(pair.userAssetFraction.toString(), pair.maxAssetAvailableFraction.toString())
    : toShare(
        {
          base: pair.currentTotalAsset.base,
          elastic: JSBI.BigInt(pair.currentAllAssets.toString()),
        } as Rebase,
        BigNumber.from(withdrawAmount.quotient.toString())
      )

    cooker.removeAsset(fraction, false) // receive to wallet
    const result = await cooker.cook()

    if (result.success) {
        return result.tx
    }
}
