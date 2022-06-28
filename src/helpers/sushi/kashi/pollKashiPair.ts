import { ethers } from "ethers";
import { PriceOracleContract } from "src/abi";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { ChainId, JSBI, KASHI_ADDRESS, Token, Currency, CurrencyAmount, Price, ZERO, USD } from '@sushiswap/core-sdk'
import { KashiMediumRiskLendingPair } from "./KashiLendingPair";
import { getOracle } from "../oracles";
import { getAddresses } from "src/constants";

export async function pollKashiPair(
    kashiContract: ethers.Contract,
    bentoBoxContract: ethers.Contract,
    who: string,
    provider: StaticJsonRpcProvider | JsonRpcProvider,
    chainId: number
    ): Promise<KashiMediumRiskLendingPair> {
    const [
        collateral,
        asset,
        oracle,
        oracleData,
        totalCollateralShare,
        userCollateralShare,
        totalAsset,
        userAssetFraction,
        totalBorrow,
        userBorrowPart,
        currentExchangeRate,
        accrueInfo,
    ] = await Promise.all(
        [
            kashiContract.collateral(),
            kashiContract.asset(),
            kashiContract.oracle(),
            kashiContract.oracleData(),
            kashiContract.totalCollateralShare(),
            kashiContract.userCollateralShare(who),
            kashiContract.totalAsset(),
            kashiContract.balanceOf(who),
            kashiContract.totalBorrow(),
            kashiContract.userBorrowPart(who),
            kashiContract.exchangeRate(),
            kashiContract.accrueInfo()
        ]
    );

    const priceOracle = new ethers.Contract(oracle, PriceOracleContract, provider)
    const [
        [,oracleExchangeRate],
        spotExchangeRate
    ] = await Promise.all([
        priceOracle.peek(oracleData),
        priceOracle.peekSpot(oracleData)
    ]);

    const tokens: Array<Token> = [
        new Token(chainId, collateral, 18),
        new Token(chainId, asset, 18),
    ];
    const totalsInBentoBox = await Promise.all([
        bentoBoxContract.totals(collateral),
        bentoBoxContract.totals(asset),
    ]);
    const rebases = {
        [collateral] : {
            token: tokens[0],
            base: JSBI.BigInt(totalsInBentoBox[0].base.toString()),
            elastic: JSBI.BigInt(totalsInBentoBox[0].elastic.toString()),
        },
        [asset]: {
            token: tokens[1],
            base: JSBI.BigInt(totalsInBentoBox[1].base.toString()),
            elastic: JSBI.BigInt(totalsInBentoBox[1].elastic.toString()),
        }
    };

    // console.log("collateral: ", collateral);
    // console.log("asset: ", asset);
    // console.log("userAssetFraction: ", userAssetFraction);
    // console.log("oracleExchangeRate: ", oracleExchangeRate.toString());
    // console.log("spotExchangeRate: ", spotExchangeRate.toString());
    // console.log("Total Balances In BentoBox: ", totalsInBentoBox);
    // console.log("collateral amount in bentoBox: ", totalsInBentoBox[0].elastic.toString())
    // console.log("asset amount in bentoBox: ", totalsInBentoBox[1].elastic.toString())
    // console.log("tokens: ", Object.values(tokens))
    // console.log("rebases: ", rebases);

    const stablecoin = CurrencyAmount.fromRawAmount(
        chainId != 4 ? 
            USD[chainId] :
            new Token(4, getAddresses(chainId).USDC_ADDRESS, 18, 'USDC', 'USD Coin'),
        0
    ).currency   

    return new KashiMediumRiskLendingPair({
        address: kashiContract.address, // pair address
        accrueInfo: {
                feesEarnedFraction: JSBI.BigInt(accrueInfo.feesEarnedFraction.toString()),
                lastAccrued: JSBI.BigInt(accrueInfo.lastAccrued),
                interestPerSecond: JSBI.BigInt(accrueInfo.interestPerSecond.toString()),
            },
            // @ts-ignore
            collateral: rebases[collateral],
            // @ts-ignore
            asset: rebases[asset],
            collateralPrice: new Price(tokens[0], stablecoin, '1', '1'),
            assetPrice: new Price(tokens[1], stablecoin, '1', '1'),
            oracle: getOracle(chainId, oracle, oracleData),
            totalCollateralShare: JSBI.BigInt(totalCollateralShare.toString()),
            totalAsset: {
                elastic: JSBI.BigInt(totalAsset.elastic.toString()),
                base: JSBI.BigInt(totalAsset.base.toString()),
            },
            totalBorrow: {
                elastic: JSBI.BigInt(totalBorrow.elastic.toString()),
                base: JSBI.BigInt(totalBorrow.base.toString()),
            },
            exchangeRate: JSBI.BigInt(currentExchangeRate.toString()),
            oracleExchangeRate: JSBI.BigInt(oracleExchangeRate.toString()),
            spotExchangeRate: JSBI.BigInt(spotExchangeRate.toString()),
            userCollateralShare: JSBI.BigInt(userCollateralShare.toString()),
            userAssetFraction: JSBI.BigInt(userAssetFraction.toString()),
            userBorrowPart: JSBI.BigInt(userBorrowPart.toString()),
    });
}
