import classnames from "classnames";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useWeb3Context } from "src/hooks";
import { Grid, InputAdornment, OutlinedInput, Accordion, Zoom, AccordionSummary, AccordionDetails, Box } from "@material-ui/core";
import { GridSpacing } from "@material-ui/core/Grid";
import { Skeleton } from "@material-ui/lab";

import { getAddresses } from "src/constants";
import { messages } from "src/constants/messages";
import { trim } from "src/helpers";
import { IPendingTxn, isPendingTxn, txnButtonText, getPendingTransInfo } from "src/store/slices/pending-txns-slice";
import { IReduxState } from "src/store/slices/state.interface";
import { IUsmLendingSlice, depositAndLendAsset, withdrawAsset } from "src/store/slices/usm-lending-slice";
import { warning, success, info, error } from "src/store/slices/messages-slice";
import { IMintSlice } from "src/store/slices/mint-slice";
import { IBiconomySlice } from "src/store/slices/biconomy-slice";
import useGasFee from "src/hooks/biconomy/useGasFee";
import useBiconomy from "src/hooks/biconomy/useBiconomy";
import HappyHourTag from "src/components/HappyHourTag/HappyHourTag";

import DownArrow from "../../assets/icons/Arrow-Down.png";
import UpArrow from "../../assets/icons/Arrow-Up.png";
import Dropdown from "./dropdown";
import "./lend.scss";

import WithdrawUSM from "./withdrawUSM";
import LendUSM from "./lendUSM";
import BorrowUSM from "./borrowUSM";
import RepayUSM from "./repayUSM";

function Lend() {
    const mintToken = useSelector<IReduxState, IMintSlice>(state => state.mint);
    const dispatch = useDispatch();
    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();
    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const [quantity, setQuantity] = useState<string>("");
    const [token, setToken] = useState<number>(1);
    const [openCoinSelection, SetOpenCoinSelecting] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
    const [completed, setCompleted] = useState<boolean>(false);
    const [lendTx, setLendTx] = useState<string>("");
    const [gasFee, setGasFee] = useState<string>("");
    const addresses = getAddresses(4);
    const USMToken = addresses.USM_ADDREESS;
    const [view, setView] = useState<number>(0);
    const [invalidAmount, setInvalidAmount] = useState<boolean>(false);
    const [dropDown, setDropDown] = useState<boolean>(false);

    const usmLending = useSelector<IReduxState, IUsmLendingSlice>(state => state.usmLending);

    const biconomyState = useSelector<IReduxState, IBiconomySlice>(state => {
        return state.biconomy;
    });

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const messageTxt = useSelector<IReduxState, string | null>(state => {
        return state.messages.message && state.messages.message.severity;
    });

    const handleCoinSelected = (index: number) => {
        setToken(index);
        SetOpenCoinSelecting(false);
        setQuantity("");
    };

    const changeView = (newView: number) => () => {
        setView(newView);
        setInvalidAmount(false);
        if (newView === 1) {
            setQuantity("20");
        } else {
            setQuantity("");
        }
    };

    const dropDownClick = () => {
        setDropDown(!dropDown);
    };

    const setMax = () => {
        // const maxAmount = findAllowance(token);
        // setQuantity(String(trim(Number(maxAmount), 4)));
    };

    return (
        <div className="lend-view">
            <Zoom in={true}>
                <div className="lend-card">
                    <HappyHourTag />
                    <Grid className="lend-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="lend-card-header">
                                <div className="lend-card-header-title">
                                    <span>Lend/Borrow</span>
                                </div>
                            </div>
                        </Grid>
                        <Grid item>
                            <div className="lend-card-description">
                                <span>Now lend or borrow U$M using D33D token</span>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid className="lend-card-grid" container direction="column" spacing={2}>
                        {!address && (
                            <div className="lend-card-wallet-notification">
                                <div className="lend-card-wallet-connect-btn" onClick={connect}>
                                    <p>Connect Wallet</p>
                                </div>
                                <p className="lend-card-wallet-desc-text">Connect your wallet to claim D33D tokens!</p>
                            </div>
                        )}
                        {address && (
                            <div>
                                <div className="lend-borrow">
                                    <Grid container spacing={1} className="lend-borrow-area">
                                        <Grid item xs={4} className="lend-borrow-three-col">
                                            <span className="lend-borrow-heading">Collateralized</span>
                                        </Grid>
                                        <Grid item xs={4} className="lend-borrow-three-col">
                                            <span className="lend-borrow-heading">Borrowed</span>
                                        </Grid>
                                        <Grid item xs={4} className="lend-borrow-three-col">
                                            <span className="lend-borrow-heading">Health</span>
                                        </Grid>
                                        <Grid item xs={4} className="lend-borrow-three-col">
                                            <span className="lend-borrow-value">
                                                {usmLending.account.collateralAmount?.toFixed(2)}
                                            </span>&nbsp;
                                            <span className="lend-borrow-symbol">D33D</span>
                                        </Grid>
                                        <Grid item xs={4} className="lend-borrow-three-col">
                                            <span className="lend-borrow-value">
                                                {usmLending.account.borrowedAmount?.toFixed(2)}
                                            </span>&nbsp;
                                            <span className="lend-borrow-symbol">USM</span>
                                        </Grid>
                                        <Grid item xs={4} className="lend-borrow-three-col">
                                            <span className="lend-borrow-value">{trim(Number(usmLending.account.health), 2)}</span>
                                            <span className="lend-borrow-symbol">%</span>
                                        </Grid>
                                    </Grid>
                                </div>

                                <div className="lend-card-action-area">
                                    <div className="lend-card-action-stage-btns-wrap">
                                        <div onClick={changeView(0)} className={classnames("lend-card-action-stage-btn", { active: view === 0 })}>
                                            <p>Borrow</p>
                                        </div>
                                        <div onClick={changeView(1)} className={classnames("lend-card-action-stage-btn", { active: view === 1 })}>
                                            <p>Repay</p>
                                        </div>
                                        <div onClick={changeView(2)} className={classnames("lend-card-action-stage-btn", { active: view === 2 })}>
                                            <p>Lend</p>
                                        </div>
                                        <div onClick={changeView(3)} className={classnames("lend-card-action-stage-btn", { active: view === 3 })}>
                                            <p>Withdraw</p>
                                        </div>
                                    </div>
                                </div>
                                {view == 0 && <BorrowUSM />}
                                {view == 1 && <RepayUSM />}
                                {view == 2 && <LendUSM />}
                                {view == 3 && <WithdrawUSM />}
                            </div>
                        )}
                    </Grid>
                </div>
            </Zoom>
        </div>
    );
}

export default Lend;
