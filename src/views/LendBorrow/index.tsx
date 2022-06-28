import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { Link } from "@material-ui/core";
import { CurrencyAmount, Percent, Token } from '@sushiswap/core-sdk'
import { IReduxState } from "src/store/slices/state.interface";
import { IUsmLendingSlice } from "src/store/slices/usm-lending-slice";
import { IMintSlice } from "src/store/slices/mint-slice";
import { formatNumber, formatPercent } from "src/helpers/sushi/lib/format";
import LinkImg from "../../assets/icons/link.png";
import D33DLogo from "../../assets/icons/D33D_logo.png";
import USMLogo from "../../assets/icons/$USM.png";
import "./lendBorrow.scss";

function LendBorrow() {
    const usmLending = useSelector<IReduxState, IUsmLendingSlice>(state => state.usmLending);
    const mintToken = useSelector<IReduxState, IMintSlice>(state => state.mint);

    const marketHealth = usmLending.account.kashiPair?.marketHealth
    console.log("marketHealth: ", marketHealth?.toString())

    const totalAssetAmount: CurrencyAmount<Token> | undefined = usmLending.account.kashiPair &&
        CurrencyAmount.fromRawAmount(usmLending.account.kashiPair.asset.token, usmLending.account.kashiPair.currentUserAssetAmount) 

    // TVL
    const currentAllAssetAmountUSD = usmLending.account.kashiPair && usmLending.account.kashiPair.currentAllAssetsUSD
    const currentAllAssetAmount: CurrencyAmount<Token> | undefined = usmLending.account.kashiPair &&
        CurrencyAmount.fromRawAmount(usmLending.account.kashiPair.asset.token, usmLending.account.kashiPair.currentAllAssets) 

    // Borrowed
    const currentBorrowedAmountInUSD = usmLending.account.kashiPair && usmLending.account.kashiPair.currentBorrowAmountUSD
    const currentBorrowedAmountIn : CurrencyAmount<Token> | undefined = usmLending.account.kashiPair &&
        CurrencyAmount.fromRawAmount(usmLending.account.kashiPair.asset.token, usmLending.account.kashiPair.currentBorrowAmount)

    // Available
    const currentAvailableAssetAmountUSD = usmLending.account.kashiPair && usmLending.account.kashiPair.totalAssetAmountUSD
    const currentAvailableAssetAmount : CurrencyAmount<Token> | undefined = usmLending.account.kashiPair &&
        CurrencyAmount.fromRawAmount(usmLending.account.kashiPair.asset.token, usmLending.account.kashiPair.totalAssetAmount)

    // current Supply APR
    const currentSupplyAPR = usmLending.account.kashiPair && new Percent(usmLending.account.kashiPair.supplyAPR, 1e18)

    // current Borrow APR
    const currentInterestPerYear = usmLending.account.kashiPair && new Percent(usmLending.account.kashiPair.currentInterestPerYear, 1e18)

    const utilization = usmLending.account.kashiPair && new Percent(usmLending.account.kashiPair.utilization, 1e18)

    console.log('TVL: ', currentAllAssetAmount?.toFixed(2))
    console.log('Borrowed: ', currentBorrowedAmountIn?.toFixed(2))
    console.log('Available: ', currentAvailableAssetAmount?.toFixed(2))
    console.log('Supply APR: ', currentSupplyAPR?.toFixed(2))
    console.log('Borrow APR: ', currentInterestPerYear?.toFixed(2))

    return (
        <div className="lend-borrow-view">
            <div className="page-head">
                <div className="text-head">
                    <div className="page-info">
                        <div className="lend-borrow-title">
                            Lend / Borrow
                        </div>
                        <div className="lend-borrow-description">
                            Now lend or borrow one of the most stable metaverse token
                        </div>
                    </div>
                </div>
                <div className="account-info">
                    <div className="action-buttons">
                        <Link component={NavLink} to="/lend-borrow-holdings">
                            <div className="button-main-action">
                                My Positions
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="protocols-list">
                <table className="protocols-list-table-view">
                    <thead>
                        <th>Collateral / Asset</th>
                        <th>TVL</th>
                        <th>Borrowed</th>
                        <th>Available</th>
                        <th>Supply APR</th>
                        <th>Borrow APR</th>
                        <th></th>
                    </thead>
                    <tr className="protocols-list-table-data">
                        <td>
                            <div className="asset-protocol-info">
                                <div className="logo-list">
                                    <img src={USMLogo} className="token-logo" alt="" />
                                    <img src={D33DLogo} className="token-logo" alt="" />
                                </div>
                                <div className="token-name">
                                    <div>D33D/USM</div>
                                </div>

                            </div>
                        </td>
                        <td>
                            ${currentAllAssetAmountUSD ? formatNumber(currentAllAssetAmountUSD.toFixed(2)) : '-'}
                        </td>
                        <td>
                            ${currentBorrowedAmountInUSD ? formatNumber(currentBorrowedAmountInUSD.toFixed(2)) : '-'}
                        </td>
                        <td>
                            ${currentAvailableAssetAmountUSD ? formatNumber(currentAvailableAssetAmountUSD.toFixed(2)) : '-'}
                        </td>
                        <td>{currentSupplyAPR != undefined ? formatPercent(currentSupplyAPR.toFixed(2)) : '0'}</td>
                        <td>{currentInterestPerYear ? formatPercent(currentInterestPerYear.toFixed(2)) : '0'}</td>
                        <td>
                            <Link component={NavLink} to="/lend">
                                <div className="button-main-action">
                                    Lend / Borrow
                                </div>
                            </Link>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    );
}

export default LendBorrow;
