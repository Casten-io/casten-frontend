import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useWeb3Context } from "../../hooks";
import { Grid, InputAdornment, OutlinedInput, Backdrop, Zoom, Slider, Fade } from "@material-ui/core";
import { IReduxState } from "../../store/slices/state.interface";
import { trim } from "../../helpers";
import { Skeleton } from "@material-ui/lab";
import { redeemToken, redeemApprove } from "../../store/slices/convert-slice";
import "./convert.scss";
import { IPendingTxn, isPendingTxn, txnButtonText, getPendingTransInfo } from "../../store/slices/pending-txns-slice";
import { max, result } from "lodash";
import axios from "../../services/axios";
import useBiconomy from "src/hooks/biconomy/useBiconomy";
import { IBiconomySlice } from "src/store/slices/biconomy-slice";
import { current } from "@reduxjs/toolkit";
import HappyHourTag from "src/components/HappyHourTag/HappyHourTag";
import Decimal from "decimal.js";
import ConvertActionModal from "./ConvertActionModal";
import useGasFee from "src/hooks/biconomy/useGasFee";
import { warning } from "../../store/slices/messages-slice";

function Convert() {
    const dispatch = useDispatch();
    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();
    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const [quantity, setQuantity] = useState<string>("");
    const [usdcQuantity, setUSDCQuantity] = useState<string>("");
    const [claimableAmount, setClaimableAmount] = useState<string>("");
    const [signature, setSignature] = useState("");
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
    const [completed, setCompleted] = useState<boolean>(false);
    const [stakeD33D, setStakeD33D] = useState<boolean>(false);
    const [invalidAmount, setInvalidAmount] = useState<boolean>(false);
    const [convertTx, setConvertTx] = useState<string>("");
    const [gasFee, setGasFee] = useState<string>("");
    // const [allowance, setAllowance] = useState<string>("");

    const { redeemP33D } = useBiconomy();
    const { getRedeemPD33D } = useGasFee();

    const pd33dBalance = useSelector<IReduxState, string>(state => {
        return state.convert.balances && state.convert.balances.pd33d;
    });

    const usdcBalance = useSelector<IReduxState, string>(state => {
        return state.convert.balances && state.convert.balances.usdc;
    });

    const isOnchainWhitelisted = useSelector<IReduxState, boolean>(state => {
        return state.convert.isWhitelisted;
    });

    const redeemable = useSelector<IReduxState, string>(state => {
        return state.convert.redeemable;
    });

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const usdcAllowance = useSelector<IReduxState, string>(state => {
        return state.convert.allowances && state.convert.allowances.usdc;
    });

    const biconomyState = useSelector<IReduxState, IBiconomySlice>(state => {
        return state.biconomy;
    });

    const convertPendingTransaction = getPendingTransInfo(pendingTransactions, "convert");
    if (convertPendingTransaction && !convertTx) {
        setConvertTx(convertPendingTransaction.txnHash);
    }

    const messageTxt = useSelector<IReduxState, string | null>(state => {
        return state.messages.message && state.messages.message.severity;
    });

    useEffect(() => {
        async function getWhitelist() {
            // base url are set under /services/axios.ts, can have a look on that

            try {
                const data = await axios.get(`/v1/contracts/redeem/${address}`);

                if (data !== undefined && data.data !== undefined) {
                    const redeemerInfo = data.data.redeemerInfo;

                    // redeemer info = null indicates no record found from backend
                    if (redeemerInfo !== null) {
                        const userSignature = redeemerInfo.signature;
                        setSignature(userSignature);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }

        getWhitelist();
        findAllowance();
    }, [signature]); // This will be loaded when the component is first created

    useEffect(() => {
        if (messageTxt === "success") {
            console.log("This one matters");
            setCompleted(true);
            setTransactionInProgress(false);
        }
    }, [messageTxt]);

    const isApprovalGranted = useCallback(() => {
        return Number(usdcAllowance) > 0;
    }, [usdcAllowance]);

    const setMax = () => {
        const maxAmount = findAllowance;
        setQuantity(maxAmount);
        setUSDCQuantity(String(Number(maxAmount) / 10));
    };

    const onClickAction = async (stake: boolean = false) => {
        const quantity_ = Number(quantity);
        if (!quantity_) {
            return dispatch(warning({ text: "Invalid amount!" }));
        }

        if (biconomyState !== undefined && biconomyState.happyHour) {
            const expectedGasFee = await getRedeemPD33D(quantity, signature, stake);
            setGasFee(expectedGasFee);
        }

        setCompleted(false);
        setOpenModal(true);
    };

    const handleModalClose = () => {
        findAllowance();
        setQuantity("");
        setUSDCQuantity("");
        setCompleted(false);
        setOpenModal(false);
    };

    const confirmModalTitle = () => {
        return "Convert";
    };

    const confirmModalDescription = () => {
        if (isPendingTxn(pendingTransactions, "convert")) {
            return <span>Converting your pD33D...</span>;
        } else if (isPendingTxn(pendingTransactions, "convert and stake")) {
            return <span>Converting your pD33D and staking...</span>;
        } else if (completed) {
            if (stakeD33D) {
                return (
                    <span>
                        Your pD33D has been converted
                        <br />
                        to vD33D and staked successfully.
                    </span>
                );
            } else {
                return (
                    <span>
                        Your pD33D has been converted
                        <br />
                        to D33D successfully.
                    </span>
                );
            }
        }

        return <span></span>;
    };

    const onConfirmAction = async () => {
        if (completed || transactionInProgress) return;

        if (address && isApprovalGranted()) {
            if (isPendingTxn(pendingTransactions, "convert")) return;
            setTransactionInProgress(true);
            if (stakeD33D) {
                onRequestConvert(quantity, 1);
            } else {
                onRequestConvert(quantity, 0);
            }
        } else {
            if (isPendingTxn(pendingTransactions, "approve_convert")) return;
            setTransactionInProgress(true);
            onRequestApprove();
        }
    };

    //replace dbWhitelist with result of API
    const findAllowance = () => {
        if (signature) {
            if (Number(usdcBalance) * 10 > Number(pd33dBalance)) {
                setClaimableAmount(pd33dBalance);

                return String(trim(Number(pd33dBalance), 4));
            } else {
                setClaimableAmount(String(Number(usdcBalance) * 10));
                return String(trim(Number(usdcBalance) * 10, 4));
            }
        } else if (isOnchainWhitelisted) {
            if (Number(usdcBalance) * 10 > Number(redeemable)) {
                setClaimableAmount(redeemable);
                return String(trim(Number(redeemable), 4));
            } else {
                setClaimableAmount(usdcBalance);
                return String(trim(Number(usdcBalance) * 10, 4));
            }
        } else {
            return "";
        }
    };

    const validateAndSetQuantity = (value: string) => {
        if (value) {
            const decimals = value.split(".");
            if (decimals && decimals[1] && decimals[1].length > 6) {
                return;
            }
        }
        setQuantity(value);
        const valueDecimal = new Decimal(value ? value : 0);
        const balanceDecimal = new Decimal(Number(claimableAmount));
        if (balanceDecimal.lt(valueDecimal)) {
            setInvalidAmount(true);
        } else {
            setInvalidAmount(false);
        }
    };

    const onRequestConvert = async (amount: string, stake: number) => {
        if (await checkWrongNetwork()) return;

        let biconomyProvider;
        let happyHour = false;
        if (biconomyState !== undefined && biconomyState.happyHour) {
            biconomyProvider = biconomyState.biconomy;
            happyHour = biconomyState.happyHour;
        }

        await redeemP33D({ provider, biconomyProvider, address, networkID: chainID, amount, signature, stake }, happyHour);
        setTransactionInProgress(false);
    };

    const onRequestApprove = async () => {
        if (await checkWrongNetwork()) return;
        await dispatch(redeemApprove({ provider, address, networkID: chainID }));
    };

    return (
        <div className="pd33d-view">
            <Zoom in={true}>
                <div className="pd33d-card">
                    <HappyHourTag />
                    <Grid className="pd33d-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="pd33d-card-header">
                                <div className="pd33d-card-header-title">
                                    <span>D33D Convert</span>
                                </div>
                            </div>
                        </Grid>
                        <Grid item>
                            <div className="pd33d-card-description">
                                <span>Convert your pD33D token into D33D</span>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid className="pd33d-card-grid" container direction="column" spacing={2}>
                        {!address && (
                            <div className="pd33d-card-wallet-notification">
                                <div className="pd33d-card-wallet-connect-btn" onClick={connect}>
                                    <p>Connect Wallet</p>
                                </div>
                                <p className="pd33d-card-wallet-desc-text">Connect your wallet to claim D33D tokens!</p>
                            </div>
                        )}
                        {address && (
                            <div>
                                <Grid container className="pd33d-card-action-area">
                                    <div className="pd33d-card-action-row">
                                        <OutlinedInput
                                            type="number"
                                            placeholder="pD33D"
                                            className="pd33d-card-action-input"
                                            value={quantity}
                                            onChange={e => {
                                                validateAndSetQuantity(e.target.value);
                                                setQuantity(e.target.value);
                                                setUSDCQuantity(String(Number(e.target.value) / 10));
                                            }}
                                            labelWidth={0}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <div onClick={setMax} className="pd33d-card-action-input-btn">
                                                        <p>Max</p>
                                                    </div>
                                                </InputAdornment>
                                            }
                                        />
                                    </div>
                                    <div className="plus-sign-container">
                                        <p className="plus-sign">+</p>
                                    </div>
                                    <div className="pd33d-card-action-row">
                                        <OutlinedInput
                                            type="number"
                                            placeholder="USDC"
                                            className="pd33d-card-action-input"
                                            value={usdcQuantity}
                                            labelWidth={0}
                                            readOnly
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <div onClick={setMax} className="pd33d-card-action-input-btn">
                                                        <p>Max</p>
                                                    </div>
                                                </InputAdornment>
                                            }
                                        />
                                    </div>
                                    <div className="convert-card-action-area-error_message">{invalidAmount && <p>Invalid Amount</p>}</div>

                                    <Grid item xs={12}>
                                        <div className="pd33d-card-tab-panel">
                                            {address && isApprovalGranted() ? (
                                                <div>
                                                    <div
                                                        className="pd33d-card-tab-panel-btn"
                                                        onClick={() => {
                                                            setStakeD33D(false);
                                                            onClickAction();
                                                        }}
                                                    >
                                                        <p>{txnButtonText(pendingTransactions, "convert", "Convert to D33D")}</p>
                                                    </div>
                                                    <div
                                                        className="pd33d-card-tab-panel-btn"
                                                        onClick={() => {
                                                            setStakeD33D(true);
                                                            onClickAction(true);
                                                        }}
                                                    >
                                                        <p>{txnButtonText(pendingTransactions, "convert", "Convert and Stake")}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className="pd33d-card-tab-panel-btn"
                                                    onClick={() => {
                                                        onRequestApprove();
                                                    }}
                                                >
                                                    <p>{txnButtonText(pendingTransactions, "approve_convert", "Approve")}</p>
                                                </div>
                                            )}
                                        </div>
                                    </Grid>
                                </Grid>
                                <div className="pd33d-user-data">
                                    <div className="data-row">
                                        <p className="data-row-name">Your Balance</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(pd33dBalance), 4)} pD33D</>}</p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">USDC Balance</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(usdcBalance), 4)} USDC</>}</p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">Redeemable Balance</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(claimableAmount), 4)} pD33D</>}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Grid>
                </div>
            </Zoom>
            <ConvertActionModal
                open={openModal}
                transactionInProgress={transactionInProgress}
                handleClose={handleModalClose}
                value={quantity}
                token={"pD33D"}
                convertTo={stakeD33D ? "vD33D" : "D33D"}
                title={confirmModalTitle()}
                description={confirmModalDescription()}
                buttonText={stakeD33D ? "Convert and Stake" : "Convert"}
                completed={completed}
                onClick={onConfirmAction}
                savedAmount={gasFee}
                convertTx={convertTx}
            />
        </div>
    );
}

export default Convert;
