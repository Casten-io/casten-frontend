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

export async function lendAssetExecute(
    {pair, depositAmount, permit, bentoBoxContract, provider, chainId, account}: 
    {
        pair: KashiMediumRiskLendingPair
        depositAmount: CurrencyAmount<Currency>
        permit?: Signature
        bentoBoxContract: ethers.Contract
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

    const deadBalance = await bentoBoxContract.balanceOf(
        pair.asset.token.address,
        "0x000000000000000000000000000000000000dead"
    )

    cooker.addAsset(
        BigNumber.from(depositAmount.quotient.toString()),
        false,
        deadBalance.isZero()
    )

    const result = await cooker.cook()

    if (result.success) {
        return result.tx
    }
}
