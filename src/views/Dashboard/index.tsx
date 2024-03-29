import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Decimal from "decimal.js";
import { Grid, InputAdornment, OutlinedInput, Box, Typography, Button, CardActions, CardContent, Card } from "@material-ui/core";
import RebaseTimer from "../../components/RebaseTimer";
import { trim } from "../../helpers";
import { changeStake, changeApproval, redeem } from "../../store/slices/stake-thunk";
import "./dashboard.scss";
import { useWeb3Context } from "../../hooks";
import { IPendingTxn, isPendingTxn, txnButtonText, getPendingTransInfo } from "../../store/slices/pending-txns-slice";
import { Skeleton } from "@material-ui/lab";
import { Route, Redirect, Switch } from "react-router-dom";
import classnames from "classnames";
import { warning } from "../../store/slices/messages-slice";
import ProductList from "src/components/ProductList";

function Dashboard() {
    const dispatch = useDispatch();
    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();

    const card = (text: string) => (
        <CardContent>
            <Typography style={{ color: "#4B584D", fontFamily: "OpenSans" }}>{text}</Typography>
            <Typography variant="h5" component="div">
                $12,000,000.00
            </Typography>
        </CardContent>
    );

    return (
        <div className="dashboard-view">
            <div className="dashboard-header">
                <Typography className="title">Lending Marketplace</Typography>
            </div>
            <div className="numbers">
                <Box className="stat-box">
                    <Card variant="outlined">{card("Total Value Locked")}</Card>
                </Box>
                <Box className="stat-box">
                    <Card variant="outlined">{card("Loan Originated")}</Card>
                </Box>
                <Box className="stat-box">
                    <Card variant="outlined">{card("Portfolio Balance")}</Card>
                </Box>
                <Box className="stat-box">
                    <Card variant="outlined" className="card">
                        {card("USDC Locked")}
                    </Card>
                </Box>
            </div>
            <ProductList />
        </div>
    );
}

export default Dashboard;
