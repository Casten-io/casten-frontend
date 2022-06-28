import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Percent } from '@sushiswap/core-sdk'
import { Grid, InputAdornment, OutlinedInput, Accordion, Zoom, AccordionSummary, AccordionDetails, Box, Modal, Paper } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";

import { useWeb3Context } from "src/hooks";
import { IReduxState } from "src/store/slices/state.interface";
import { messages } from "src/constants/messages";
import { shorten, trim } from "src/helpers";

import { IUsmLendingSlice, depositAndLendAsset } from "src/store/slices/usm-lending-slice";
import { IMintSlice } from "src/store/slices/mint-slice";
import { IPendingTxn, isPendingTxn, txnButtonText, getPendingTransInfo } from "src/store/slices/pending-txns-slice";
import { warning, success, info, error } from "src/store/slices/messages-slice";

import "./lend.scss";
import UpArrow from "src/assets/icons/Arrow-Up.png";
import DownArrow from "../../assets/icons/Arrow-Down.png";
import CloseIcon from "../../assets/icons/close.svg";
import D33DLogo from "../../assets/icons/D33D_logo.png";
import USMLogo from "../../assets/icons/$USM.png";

function LendUSM() {
    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();
    const dispatch = useDispatch();
    const [lendAmount, setLendAmount] = useState<string>("");

    const [txnInProgress, setTxnInProgress] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [txnHash, setTxnHash] = useState<string>("");

    const mintToken = useSelector<IReduxState, IMintSlice>(state => state.mint);
    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });
    const usmLending = useSelector<IReduxState, IUsmLendingSlice>(state => state.usmLending);

    const isPendingLend = useMemo(() => isPendingTxn(pendingTransactions, "Lending USM"), [pendingTransactions])

    useEffect(() => {
        console.log('isPendingLend: ', isPendingLend)
        if (isPendingLend) {
            setShowConfirmModal(false)
            setShowSuccessModal(true)

            const txnInfo = getPendingTransInfo(pendingTransactions, "Lending USM")
            if (txnInfo) {
                console.log('pending txn ...', txnInfo.txnHash)
                setTxnHash(txnInfo.txnHash)
            }
        }

        setTxnInProgress(false)
    }, [isPendingLend])

    useEffect(() => {
        if (!usmLending.loading && usmLending.rejected) {
            console.log("lending is rejected.")
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
        setLendAmount(mintToken.balances.usm)
    };

    const onClickLend = async () => {
        console.log("lending ...")

        if (Number(lendAmount) > 0 && usmLending.account.kashiPair) {
            setTxnInProgress(false)
            setShowConfirmModal(true)
        } else {
            dispatch(error({
                text: messages.invalid_amount
            }))
        }
    }

    const onClickConfirmLend = async () => {
        if ((Number(lendAmount) > 0 && usmLending.account.kashiPair) && (!txnInProgress)) {
            setTxnInProgress(true)

            await dispatch(
                depositAndLendAsset({
                    pair: usmLending.account.kashiPair,
                    account: address,
                    networkID: chainID,
                    provider,
                    approved: usmLending.account.approvedKashiInBentoBox,
                    amount: lendAmount
                })
            )

            // reset status
            setLendAmount("")
        }
    }

    return (
        <>
            <Grid container className="lend-card-action-area">
                <Grid item xs={6} className="lend-card-action-area-header-one">
                    Lend USM
                </Grid>
                <Grid item xs={6} className="lend-card-action-area-header-two">
                    Balance: {trim(Number(mintToken.balances.usm), 2)}
                </Grid>
                <div className="lend-card-action-row">
                    <OutlinedInput
                        type="number"
                        placeholder="Amount"
                        className="lend-card-action-input"
                        value={lendAmount}
                        onChange={e => {
                            setLendAmount(e.target.value);
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

                <Grid item xs={12}>
                    <div className="lend-card-tab-panel">
                        <div className="lend-card-tab-panel-btn" onClick={onClickLend}>
                            <p>{txnButtonText(pendingTransactions, "Lending USM", "Lend")}</p>
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
                                <div className="lend-card-final-detail">Deposited</div>
                                <div className="lend-card-final-detail">
                                    {usmLending.account.assetAmount?.toFixed(2)} USM -{'>'} {trim(Number(usmLending.account.assetAmount?.toFixed(2)) + Number(lendAmount), 2)} USM
                                </div>
                            </Grid>
                            <Grid item xs={1} className="lend-card-action-row-final-img">
                                <img src={UpArrow}></img>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container>
                                <Grid item xs={11} className="lend-card-action-row-final-item">
                                    <div className="lend-card-final-detail">Supply APR</div>
                                </Grid>
                                <Grid item xs={1} className="lend-card-action-row-final-img">
                                    <div>
                                        {usmLending.account.kashiPair && new Percent(usmLending.account.kashiPair.supplyAPR, 1e18).toFixed(6)}%
                                    </div>
                                </Grid>
                                <Grid item xs={11} className="lend-card-action-row-final-item">
                                    <div className="lend-card-final-detail">Health</div>
                                </Grid>
                                <Grid item xs={1} className="lend-card-action-row-final-img">
                                    <div>
                                        {usmLending.total.marketHealth && usmLending.total.marketHealth.toFixed(6)}%
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <hr style={{ borderTop: "1px dashed"}}/>
                                </Grid>
                                <Grid item xs={6} className="lend-card-action-row-final-item">
                                    <div className="lend-card-final-detail">Total Lend</div>
                                </Grid>
                                <Grid item xs={6} className="lend-card-action-row-final-img">
                                    <div>
                                        {usmLending.total.lentAmount?.toFixed(2)} USM -{'>'} {trim(Number(usmLending.total.lentAmount?.toFixed(2)) + Number(lendAmount), 2)} USM
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
            </Grid>
            <Modal id="usm-confirm-modal" open={showConfirmModal} onClose={closeConfirmModal}>
                <Paper className="ohm-card ohm-popover">
                    <div className="usm-confirm-modal__header">
                        <div className="usm-confirm-modal__title">
                            Confirm Lend
                        </div>
                        <div className="cancel-modal" onClick={closeConfirmModal}>
                            <img src={CloseIcon} alt="close" />
                        </div>
                    </div>
                    <div className="usm-confirm-details">
                        <div className="usm-confirm-details__item">
                            <div className="usm-confirm-details__item__text">
                                You will lend
                            </div>
                            <div className="usm-confirm-details__item__value">
                            <img src={USMLogo} className="token-logo" alt="" /> {lendAmount} &nbsp;<span className="token-name">USM</span>
                            </div>
                        </div>
                    </div>
                    <div className="usm-confirm-btn" onClick={onClickConfirmLend}>
                    {
                        isPendingTxn(pendingTransactions, "Lending USM") || txnInProgress ? (
                            <CircularProgress size={15} color="primary" />
                        ) : (
                            <p>Confirm Lend</p>
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
                                    20.54%
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
                                    Total Lend
                                </div>
                                <div className="usm-confirm-summary__details__item__value">
                                    {usmLending.total.lentAmount?.toFixed(2)} USM -{'>'} {trim(Number(usmLending.total.lentAmount?.toFixed(2)) + Number(lendAmount), 2)} USM
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
                    <div className="usm-success-notification">Success! Deposit submitted</div>
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
                                {isPendingLend ? (<em>In Progress</em>) : (<em>Success</em>)}
                            </div>
                        </div>
                    </div>
                </Paper>
            </Modal>
        </>
    )
}

export default LendUSM;
