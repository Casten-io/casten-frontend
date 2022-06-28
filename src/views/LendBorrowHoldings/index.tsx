import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { Link } from "@material-ui/core";
import { CurrencyAmount, Percent, Token } from '@sushiswap/core-sdk'
import { trim, shorten } from "src/helpers";
import { IReduxState } from "src/store/slices/state.interface";
import { IUsmLendingSlice } from "src/store/slices/usm-lending-slice";
import { useAddress, useWeb3Context } from "src/hooks";
import { formatNumber, formatPercent } from "src/helpers/sushi/lib/format";
import LinkImg from "../../assets/icons/link.png";
import D33DLogo from "../../assets/icons/D33D_logo.png";
import USMLogo from "../../assets/icons/$USM.png";
import "./lendBorrowHoldings.scss";

function LendBorrowHoldings() {
    const address = useAddress();
    const usmLending = useSelector<IReduxState, IUsmLendingSlice>(state => state.usmLending);

    // collateral amount
    const userCollateralAmount: CurrencyAmount<Token> | undefined = usmLending.account.kashiPair &&
        CurrencyAmount.fromRawAmount(usmLending.account.kashiPair.collateral.token, usmLending.account.kashiPair.userCollateralAmount) 

    // borrow amount
    const userBorrowAmount: CurrencyAmount<Token> | undefined = usmLending.account.kashiPair &&
        CurrencyAmount.fromRawAmount(usmLending.account.kashiPair.asset.token, usmLending.account.kashiPair.currentUserBorrowAmount) 

    // Available
    const currentAvailableAssetAmountUSD = usmLending.account.kashiPair && usmLending.account.kashiPair.totalAssetAmountUSD

    // utilization
    const userHealth = usmLending.account.kashiPair && new Percent(usmLending.account.kashiPair.health, 1e18)

    // current Supply APR
    const currentSupplyAPR = usmLending.account.kashiPair && new Percent(usmLending.account.kashiPair.currentSupplyAPR, 1e18)

    return (
        <div className="lend-borrow-holdings-view">
            <div className="page-head">
                <div className="text-head">
                    <div className="amount-info">
                        <div className="address-hash">
                            {shorten(address)}
                            <a href="https://metapoly.org" target="__blank">
                                <img className="link-img" src={LinkImg} alt="" />
                            </a>
                        </div>
                        <div className="net-worth-label">
                            Net worth
                        </div>
                        <div>
                            $5023.30
                        </div>
                    </div>
                </div>
                <div className="account-info-wrapper">
                    <div className="account-info">
                        <Link component={NavLink} to="/lend">
                            <div className="button-main-action">
                                Lend / Borrow
                            </div>
                        </Link>
                        <div className="account-info-details">
                            <div className="asset-info">
                                <div> Wallet</div>
                                <div> $5023.30</div>
                            </div>
                            <div className="wallet-balance">
                                <div> Assets</div>
                                <div> 1</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="protocols-list">
                <table className="protocols-list-table-view">
                    <thead>
                    <th>Collateral / Asset</th>
                    <th>Supplied</th>
                    <th>Borrowed</th>
                    <th>Available</th>
                    <th>Utilization</th>
                    <th>Supply APR</th>
                    </thead>
                    <tr className="protocols-list-table-data">
                        <td>
                            <div className="asset-protocol-info">
                                <div className="left-pad"/>
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
                            ${userCollateralAmount?.toFixed(2)}
                        </td>
                        <td>
                            ${userBorrowAmount?.toFixed(2)}
                        </td>
                        <td>
                            ${currentAvailableAssetAmountUSD ? formatNumber(currentAvailableAssetAmountUSD.toFixed(2)) : '-'}
                        </td>
                        <td>
                            {userHealth ? formatPercent(userHealth.toFixed(2)) : '0'}
                        </td>
                        <td>
                            {currentSupplyAPR != undefined ? formatPercent(currentSupplyAPR.toFixed(2)) : '0'}
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    );
}

export default LendBorrowHoldings;
