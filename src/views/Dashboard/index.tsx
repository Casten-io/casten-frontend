import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Decimal from "decimal.js";
import { Grid, InputAdornment, OutlinedInput, Typography, Zoom } from "@material-ui/core";
import RebaseTimer from "../../components/RebaseTimer";
import { trim } from "../../helpers";
import { changeStake, changeApproval, redeem } from "../../store/slices/stake-thunk";
import "./dashboard.scss";
import { useWeb3Context } from "../../hooks";
import { IPendingTxn, isPendingTxn, txnButtonText, getPendingTransInfo } from "../../store/slices/pending-txns-slice";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { messages } from "../../constants/messages";
import classnames from "classnames";
import { warning } from "../../store/slices/messages-slice";
import ProductList from "src/components/ProductList";

function Dashboard() {
    const dispatch = useDispatch();
    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();

    return (
        <div className="dashboard-view">
            <div className="dashboard-header">
                <Typography className="title">Lending Marketplace</Typography>
            </div>
            <div className="numbers">
                <div className="stat">
                    <Typography className="text">Total Value Locked</Typography>
                    <Typography>$12,000,000.00</Typography>
                </div>
                <div className="stat">
                    <Typography className="text">Loan Originated</Typography>
                    <Typography>$12,000,000.00</Typography>
                </div>
                <div className="stat">
                    <Typography className="text">Portfolio Balance</Typography>
                    <Typography>$12,000,000.00</Typography>
                </div>
                <div className="stat">
                    <Typography className="text">USDC Balance</Typography>
                    <Typography>$12,000,000.00</Typography>
                </div>
            </div>

            <ProductList />
        </div>
    );
}

export default Dashboard;
