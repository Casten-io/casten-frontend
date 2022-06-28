import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Grid, InputAdornment, OutlinedInput, Accordion, Zoom, AccordionSummary, AccordionDetails, Box, Modal, Paper } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Percent } from '@sushiswap/core-sdk'

import { useWeb3Context } from "src/hooks";
import { IReduxState } from "src/store/slices/state.interface";
import { messages } from "src/constants/messages";
import { trim, shorten } from "src/helpers";

import { IUsmLendingSlice, borrowAsset } from "src/store/slices/usm-lending-slice";
import { IMintSlice } from "src/store/slices/mint-slice";
import { IPendingTxn, isPendingTxn, txnButtonText, getPendingTransInfo } from "src/store/slices/pending-txns-slice";
import { warning, success, info, error } from "src/store/slices/messages-slice";

import "./lend.scss";
import "./borrowUsmModal.scss"
import UpArrow from "src/assets/icons/Arrow-Up.png";
import DownArrow from "../../assets/icons/Arrow-Down.png";
import CloseIcon from "../../assets/icons/close.svg";
import D33DLogo from "../../assets/icons/D33D_logo.png";
import USMLogo from "../../assets/icons/$USM.png";

function BorrowUSM() {
    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();
    const dispatch = useDispatch();
    const [collateralAmount, setCollateralAmount] = useState<string>("");
    const [borrowAmount, setBorrowAmount] = useState<string>("");

    const [txnInProgress, setTxnInProgress] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
    const [txnHash, setTxnHash] = useState<string>("")

    const mintToken = useSelector<IReduxState, IMintSlice>(state => state.mint);
    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });
    const usmLending = useSelector<IReduxState, IUsmLendingSlice>(state => state.usmLending);
    const isPendingBorrow = useMemo(() => isPendingTxn(pendingTransactions, "Borrowing USM"), [pendingTransactions])

    useEffect(() => {
        console.log('isPendingBorrow: ', isPendingBorrow)
        if (isPendingBorrow) {
            setShowConfirmModal(false)
            setShowSuccessModal(true)

            const txnInfo = getPendingTransInfo(pendingTransactions, "Borrowing USM")
            if (txnInfo) {
                console.log('pending txn ...', txnInfo.txnHash)
                setTxnHash(txnInfo.txnHash)
            }
        }

        setTxnInProgress(false)
    }, [isPendingBorrow])

    useEffect(() => {
        if (!usmLending.loading && usmLending.rejected) {
            console.log("borrowing is rejected.")
            setTxnInProgress(false)
            setShowConfirmModal(false)
        }
    }, [usmLending])

    const closeConfirmModal = () => {
        setShowConfirmModal(false)
    }

    const closeSuccessModal = () => {
        setShowSuccessModal(false)
    }

    const setMax = () => {
        setCollateralAmount(mintToken.balances.d33d)
    };

    const onClickBorrow = async () => {
        if ((Number(collateralAmount) > 0 || Number(borrowAmount) > 0) && (usmLending.account.kashiPair)) {
            console.log('collateral amount: ', Number(collateralAmount))
            console.log('asset amount: ', Number(borrowAmount) * 0.75)
            if (Number(borrowAmount) > Number(collateralAmount) * 0.75) {
                dispatch(error({
                    text: messages.not_enough_collateral
                }))
                return
            }
            if (Number(collateralAmount) > Number(mintToken.balances.d33d)) {
                dispatch(error({
                    text: messages.big_collateral
                }))
                return
            }
            setShowConfirmModal(true)
            setTxnInProgress(false)
        } else {
            dispatch(error({
                text: messages.invalid_amount
            }))
        }
    }

    const onClickConfirmBorrow = async () => {
        if (((Number(collateralAmount) > 0 || Number(borrowAmount) > 0) && (usmLending.account.kashiPair)) && (!txnInProgress)) {
            setTxnInProgress(true)
            await dispatch(
                borrowAsset({
                    pair: usmLending.account.kashiPair,
                    account: address,
                    networkID: chainID,
                    provider,
                    collateralAmount,
                    borrowAmount,
                    approved: usmLending.account.approvedKashiInBentoBox
                })
            )

            setCollateralAmount("")
            setBorrowAmount("")
        }
    }

    return (
        <>
            <Grid container className="lend-card-action-area">
                <Grid item xs={6} className="lend-card-action-area-header-one">
                    Deposit D33D
                </Grid>
                <Grid item xs={6} className="lend-card-action-area-header-two">
                    Balance: {trim(Number(mintToken.balances.d33d), 2)}
                </Grid>
                <div className="lend-card-action-row">
                    <OutlinedInput
                        type="number"
                        placeholder="Amount"
                        className="lend-card-action-input"
                        value={collateralAmount}
                        onChange={e => {
                            setCollateralAmount(e.target.value);
                        }}
                        labelWidth={0}
                        endAdornment={
                            <InputAdornment position="end">
                                <div onClick={setMax} className="lend-card-action-input-btn">
                                    <p>Max</p>
                                </div>
                            </InputAdornment>
                        }
                    />
                </div>
                <Grid item xs={12} className="lend-card-action-arrow">
                    <img src={DownArrow}></img>
                </Grid>

                <div className="lend-card-action-area-header-one">Borrow USM</div>

                <div className="lend-card-action-row">
                    <OutlinedInput
                        type="number"
                        placeholder="Amount"
                        className="lend-card-action-input"
                        value={borrowAmount}
                        onChange={e => {
                            setBorrowAmount(e.target.value);
                        }}
                        labelWidth={0}
                    />
                </div>

                <Grid item xs={12}>
                    <div className="lend-card-tab-panel">
                        <div className="lend-card-tab-panel-btn" onClick={onClickBorrow}>
                            <p>{txnButtonText(pendingTransactions, "Borrowing USM", "Borrow")}</p>
                        </div>
                    </div>
                </Grid>
                <Grid container className="lend-card-action-row-final">
                    <Accordion>
                        <AccordionSummary
                            // expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Grid item xs={11} className="lend-card-action-row-final-item">
                                <div className="lend-card-final-detail">Liquidation Price</div>
                                <div className="lend-card-final-detail">1 D33D = 1 USM</div>
                            </Grid>
                            <Grid item xs={1} className="lend-card-action-row-final-img">
                                <img src={UpArrow}></img>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container>
                                <Grid item xs={11} className="lend-card-action-row-final-item">
                                    <div className="lend-card-final-detail">APR (annualized)</div>
                                </Grid>
                                <Grid item xs={1} className="lend-card-action-row-final-img">
                                    <div>
                                        {usmLending.account.kashiPair && new Percent(usmLending.account.kashiPair.currentInterestPerYear, 1e18).toFixed(2)}%
                                    </div>
                                </Grid>
                                <Grid item xs={11} className="lend-card-action-row-final-item">
                                    <div className="lend-card-final-detail">Loan to Value(LTV)</div>
                                </Grid>
                                <Grid item xs={1} className="lend-card-action-row-final-img">
                                    <div> 75%</div>
                                </Grid>
                                <Grid item xs={12}>
                                    <hr style={{ borderTop: "1px dashed"}}/>
                                </Grid>
                                <Grid item xs={6} className="lend-card-action-row-final-item">
                                    <div className="lend-card-final-detail">Total Collateral</div>
                                </Grid>
                                <Grid item xs={6} className="lend-card-action-row-final-img">
                                    <div>
                                        {usmLending.total.collateralAmount?.toFixed(0)} D33D -{'>'} {Number(usmLending.total.collateralAmount?.toFixed(2)) + Number(collateralAmount)} D33D
                                    </div>
                                </Grid>
                                <Grid item xs={6} className="lend-card-action-row-final-item">
                                    <div className="lend-card-final-detail">Total Borrowed</div>
                                </Grid>
                                <Grid item xs={6} className="lend-card-action-row-final-img">
                                    <div>
                                        {usmLending.total.borrowedAmount?.toFixed(2)} USM -{'>'} {trim(Number(usmLending.total.borrowedAmount?.toFixed(2)) + Number(borrowAmount), 2)} USM
                                    </div>
                                </Grid>
                                <Grid item xs={8} className="lend-card-action-row-final-item">
                                    <div className="lend-card-final-detail">Oracle</div>
                                </Grid>
                                <Grid item xs={4} className="lend-card-action-row-final-img">
                                    <div> Chainlink</div>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                {/* {dropDown && (
                    <Grid>
                    </Dropdown>
                    </Grid>
                )} */}
            </Grid>
            <Modal id="usm-confirm-modal" open={showConfirmModal} onClose={closeConfirmModal}>
                <Paper className="ohm-card ohm-popover">
                    <div className="usm-confirm-modal__header">
                        <div className="usm-confirm-modal__title">
                            Confirm Borrow
                        </div>
                        <div className="cancel-modal" onClick={closeConfirmModal}>
                            <img src={CloseIcon} alt="close" />
                        </div>
                    </div>
                    <div className="usm-confirm-details">
                        <div className="usm-confirm-details__item">
                            <div className="usm-confirm-details__item__text">
                                You will deposit collateral
                            </div>
                            <div className="usm-confirm-details__item__value">
                            <img src={D33DLogo} className="token-logo" alt="" /> {collateralAmount} &nbsp;<span className="token-name">D33D</span>
                            </div>
                        </div>
                        <div className="usm-confirm-details__item">
                            <div className="usm-confirm-details__item__text">
                                to borrow
                            </div>
                            <div className="usm-confirm-details__item__value">
                            <img src={USMLogo} className="token-logo" alt="" /> {borrowAmount} &nbsp;<span className="token-name">USM</span>
                            </div>
                        </div>
                    </div>
                    <div className="usm-confirm-btn" onClick={onClickConfirmBorrow}>
                        {
                            isPendingTxn(pendingTransactions, "Borrowing USM") || txnInProgress ? (
                                <CircularProgress size={15} color="primary" />
                            ) : (
                                <p>Confirm Borrow</p>
                            )
                        }
                    </div>
                    <div className="usm-confirm-summary">
                        <div className="usm-confirm-summary__details">
                            <div className="usm-confirm-summary__details__item">
                                <div className="usm-confirm-summary__details__item__text">
                                    Liquidation Price
                                </div>
                                <div className="usm-confirm-summary__details__item__value">
                                    1 D33D = 1 USM
                                </div>
                            </div>
                            <div className="usm-confirm-summary__details__item">
                                <div className="usm-confirm-summary__details__item__text">
                                    APR (annualized)
                                </div>
                                <div className="usm-confirm-summary__details__item__value">
                                    {usmLending.account.kashiPair && new Percent(usmLending.account.kashiPair.currentInterestPerYear, 1e18).toFixed(2)}%
                                </div>
                            </div>
                            <div className="usm-confirm-summary__details__item">
                                <div className="usm-confirm-summary__details__item__text">
                                    Loan to Value (LTV)
                                </div>
                                <div className="usm-confirm-summary__details__item__value">
                                    75%
                                </div>
                            </div>
                        </div>
                        <div className="usm-confirm-summary__params">
                            <div className="usm-confirm-summary__details__item">
                                <div className="usm-confirm-summary__details__item__text">
                                    Total Collateral
                                </div>
                                <div className="usm-confirm-summary__details__item__value">
                                    {usmLending.total.collateralAmount?.toFixed(0)} D33D -{'>'} {Number(usmLending.total.collateralAmount?.toFixed(2)) + Number(collateralAmount)} D33D
                                </div>
                            </div>
                            <div className="usm-confirm-summary__details__item">
                                <div className="usm-confirm-summary__details__item__text">
                                    Total Borrowed
                                </div>
                                <div className="usm-confirm-summary__details__item__value">
                                    {usmLending.total.borrowedAmount?.toFixed(2)} USM -{'>'} {trim(Number(usmLending.total.borrowedAmount?.toFixed(2)) + Number(borrowAmount), 2)} USM
                                </div>
                            </div>
                            <div className="usm-confirm-summary__details__item">
                                <div className="usm-confirm-summary__details__item__text">
                                    Oracle
                                </div>
                                <div className="usm-confirm-summary__details__item__value">
                                    Chainlink
                                </div>
                            </div>
                        </div>
                    </div>
                </Paper>
            </Modal>
            <Modal id="usm-success-modal" open={showSuccessModal} onClose={closeSuccessModal}>
                <Paper className="ohm-card ohm-popover">
                    <div className="usm-success-modal__header">
                        <div className="usm-success-modal__title">
                            Success!
                        </div>
                        <div className="cancel-modal" onClick={closeSuccessModal}>
                            <img src={CloseIcon} alt="close" />
                        </div>
                    </div>
                    <div className="usm-success-notification">Success! Borrow submitted</div>
                    <div className="usm-success-details">
                        <div className="usm-success-details__item">
                            <div className="usm-success-details__item__text">
                                Transaction Hash
                            </div>
                            <div className="usm-success-details__item__value">
                                <a href={"https://rinkeby.etherscan.io/tx/" + txnHash} target="_blank">{shorten(txnHash)}</a>
                            </div>
                        </div>
                        <div className="usm-success-details__item">
                            <div className="usm-success-details__item__text">
                                Status
                            </div>
                            <div className="usm-success-details__item__value">
                                {isPendingBorrow ? (<em>In Progress</em>) : (<em>Success</em>)}
                            </div>
                        </div>
                    </div>
                </Paper>
            </Modal>
        </>
    )
}

export default BorrowUSM;
