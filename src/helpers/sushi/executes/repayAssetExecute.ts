import { ethers } from "ethers";
import { BigNumber } from '@ethersproject/bignumber'
import { Signature } from '@ethersproject/bytes'
import { TransactionResponse } from '@ethersproject/providers'
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Currency, CurrencyAmount, JSBI } from '@sushiswap/core-sdk'
import { toShare } from '@sushiswap/bentobox-sdk'
import { useCallback } from 'react'
import { getAddresses } from "src/constants";
import { KashiMediumRiskLendingPair } from "../kashi/KashiLendingPair";
import KashiCooker from "../kashi/kashiCooker";

export async function repayAssetExecute({
    pair, repayAmount, removeMax, removeAmount, repayMax, provider, chainId, account}:
    {
        pair: KashiMediumRiskLendingPair
        repayAmount: CurrencyAmount<Currency>
        removeAmount: CurrencyAmount<Currency>
        repayMax: boolean
        removeMax: boolean
        provider: JsonRpcProvider | StaticJsonRpcProvider
        chainId: number
        account: string
    }
): Promise<TransactionResponse | undefined> {
    const cooker = new KashiCooker(pair, account, provider, chainId)

    if (repayMax && JSBI.greaterThan(pair.userBorrowPart, JSBI.BigInt(0))) {
        cooker.repayPart(BigNumber.from(pair.userBorrowPart.toString()), false)
    } else if (repayAmount.greaterThan(0)) {
        cooker.repay(BigNumber.from(repayAmount.quotient.toString()), false)
    }

    let share
    if (removeMax) {
        share = pair.userCollateralShare
    } else if (removeAmount?.greaterThan(0)) {
        share = toShare(pair.collateral, removeAmount.quotient)
    }

    if (share) {
        cooker.removeCollateral(BigNumber.from(share.toString()), false)
    }

    const result = await cooker.cook()

    if (result.success) {
        return result.tx
    }
}
