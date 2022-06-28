import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Decimal from "decimal.js";
import { Grid, InputAdornment, OutlinedInput, Zoom } from "@material-ui/core";
import RebaseTimer from "../../components/RebaseTimer";
import { trim } from "../../helpers";
import { changeStake, changeApproval, redeem } from "../../store/slices/stake-thunk";
import "./stake.scss";
import { useWeb3Context } from "../../hooks";
import { IPendingTxn, isPendingTxn, txnButtonText, getPendingTransInfo } from "../../store/slices/pending-txns-slice";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { messages } from "../../constants/messages";
import classnames from "classnames";
import { warning } from "../../store/slices/messages-slice";

import MetapolyIcon from "../../assets/icons/metapoly-home.svg";
import InfoIcon from "../../assets/icons/info.svg";
import StakeEarn from "../../assets/images/stake-earn.png";

import StakingActionModal from "./StakingActionModal";
import useBiconomy from "src/hooks/biconomy/useBiconomy";
import { IBiconomySlice } from "src/store/slices/biconomy-slice";
import useGasFee from "src/hooks/biconomy/useGasFee";

const events = (view: number) => {
    if (view === 0) {
        return "Stake";
    } else if (view === 1) {
        return "Unstake";
    } else {
        return "Redeem";
    }
};

function Stake() {
    const dispatch = useDispatch();
    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();

    const [view, setView] = useState<number>(0);
    const [quantity, setQuantity] = useState<string>("");
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [completed, setCompleted] = useState<boolean>(false);
    const [invalidAmount, setInvalidAmount] = useState<boolean>(false);
    const [gasFee, setGasFee] = useState<string>("");

    const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
    const [stakingTx, setStakingTx] = useState<string>("");
    
    const { stakeD33D, claimRewards } = useBiconomy();
    const { getStakeD33DGasFee, getStakeRedeemGasFee } = useGasFee();
    
    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const currentIndex = useSelector<IReduxState, string>(state => {
        return state.app.currentIndex;
    });
    const fiveDayRate = useSelector<IReduxState, number>(state => {
        return state.app.fiveDayRate;
    });
    const totalStakedBalance = useSelector<IReduxState, string>(state => {
        return state.account.balances && state.account.balances.totalStaked;
    });
    const redeemableBalanceWithPenalty = useSelector<IReduxState, number>(state => {
        return state.account.rewards && state.account.rewards.withdrawn;
    });
    const redeemableBalanceWithoutPenalty = useSelector<IReduxState, number>(state => {
        return state.account.rewards && state.account.rewards.penalty + state.account.rewards.withdrawn;
    });
    const rewardInUSM = useSelector<IReduxState, number>(state => {
        return state.account.rewards && state.account.rewards.rewardInUSM;
    });
    const d33dBalance = useSelector<IReduxState, string>(state => {
        return state.account.balances && state.account.balances.d33d;
    });
    const gD33dBalance = useSelector<IReduxState, string>(state => {
        return state.account.balances && state.account.balances.gD33d;
    });
    const gd33dExchangeRate = useSelector<IReduxState, number>(state => {
        return state.account.exchange && state.account.exchange.gd33d;
    });
    const stakeAllowance = useSelector<IReduxState, number>(state => {
        return state.account.staking && state.account.staking.d33d;
    });
    const unstakeAllowance = useSelector<IReduxState, number>(state => {
        return state.account.staking && state.account.staking.gD33d;
    });
    const stakingRebase = useSelector<IReduxState, number>(state => {
        return state.app.stakingRebase;
    });
    const stakingAPY = useSelector<IReduxState, number>(state => {
        return state.app.stakingAPY;
    });
    const stakingTVL = useSelector<IReduxState, number>(state => {
        return state.app.stakingTVL;
    });
    const nextRewardAmount = useSelector<IReduxState, number>(state => {
        return state.account.nextRewardAmount;
    });
    const rewardPenaltyPercentage = useSelector<IReduxState, number>(state => {
        return state.account.rewards.total != 0 ? state.account.rewards.penalty / state.account.rewards.total : 0;
    });
    const lockupEndTime = useSelector<IReduxState, number>(state => {
        return state.account.lockUpEndTime;
    });
    const messageTxt = useSelector<IReduxState, string | null>(state => {
        return state.messages.message && state.messages.message.severity;
    });

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const biconomyState = useSelector<IReduxState, IBiconomySlice>(state => {
        return state.biconomy;
    })

    const stakingPendingTransaction = getPendingTransInfo(pendingTransactions, "staking");
    if (stakingPendingTransaction && !stakingTx) {
        setStakingTx(stakingPendingTransaction.txnHash);
    }
    const setMax = () => {
        if (view === 0) {
            setQuantity(new Decimal(d33dBalance).toFixed(6));
        } else {
            setQuantity(parseFloat(gD33dBalance.toString()).toFixed());
        }
    };

    const onSeekApproval = async (token: string) => {
        if (await checkWrongNetwork()) return;
        await dispatch(changeApproval({ address, token, provider, networkID: chainID }));
    };

    const onChangeStake = async (action: string) => {
        if (await checkWrongNetwork()) return;

        if (quantity === "" || parseFloat(quantity) === 0) {
            dispatch(warning({ text: action === "stake" ? messages.before_stake : messages.before_unstake }));
        } else {
            let biconomyProvider;
            let happyHour = false;
            if(biconomyState!==undefined && biconomyState.happyHour) {
                biconomyProvider = biconomyState.biconomy;
                happyHour = biconomyState.happyHour;
            }

            await stakeD33D({
                address, 
                action, 
                value: String(quantity), 
                provider, 
                networkID: chainID,
                biconomyProvider
            }, happyHour);

            // await dispatch(changeStake({ address, action, value: String(quantity), provider, networkID: chainID }));

            setOpenModal(false);
            setQuantity("");
            setCompleted(false);
        }
    };

    const onClaim = async () => {
        if (await checkWrongNetwork()) return;
        const expectedGasFee = await getStakeRedeemGasFee();
        setGasFee(expectedGasFee !== undefined ? expectedGasFee : "0");
        setOpenModal(true);
    };

    const onRedeemConfirm = async () => {
        let biconomyProvider;
        let happyHour = false;
        if(biconomyState!==undefined && biconomyState.happyHour) {
            biconomyProvider = biconomyState.biconomy;
            happyHour = biconomyState.happyHour;
        }
    
        await claimRewards({
            action: "redeem", 
            provider, 
            networkID: chainID, 
            biconomyProvider, 
            address
        }, happyHour);
        
        // await dispatch(redeem({ action: "redeem", provider, address, networkID: chainID }));
    }

    const handleModalClose = () => {
        setCompleted(false);
        setOpenModal(false);
    };

    useEffect(() => {
        if (messageTxt === "info") {
            if (view !== 0 || hasAllowance("d33d")) {
                setCompleted(true);
            }
            setTransactionInProgress(false);
        }
    }, [messageTxt]);

    const hasAllowance = useCallback(
        token => {
            if (token === "d33d") return stakeAllowance > 0;
            if (token === "gD33d") return unstakeAllowance > 0;
            return 0;
        },
        [stakeAllowance],
    );

    const changeView = (newView: number) => () => {
        setView(newView);
        setInvalidAmount(false);
        if(newView === 1) {
            setQuantity(parseFloat(gD33dBalance.toString()).toFixed());
        } else {
            setQuantity("");
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
        const valueDecimal = new Decimal(value? value: 0);
        const balanceDecimal = new Decimal(d33dBalance || 0);
        const unstakeBalanceDecimal = new Decimal(gD33dBalance || 0);
        if((view === 0 && balanceDecimal.lt(valueDecimal)) || (view === 1 && unstakeBalanceDecimal.lt(valueDecimal))) {
            setInvalidAmount(true);
        } else {
            setInvalidAmount(false);
        }
    };

    const onClickAction = async() => {
        const quantity_ = Number(quantity);
        if (!quantity_) {
            return dispatch(warning({ text: "Invalid amount!" }));
        }

        // For stake, and approved spending allowance on staking contract
        if(hasAllowance("d33d") && view === 0) {
            const expectedGasFee = await getStakeD33DGasFee(quantity, address);
            setGasFee(expectedGasFee !== undefined ? expectedGasFee : "0");
        }

        setCompleted(false);
        setOpenModal(true);
    };

    const confirmModalTitle = () => {
        if (view === 0) {
            return address && hasAllowance("d33d") ? "Confirm Stake" : "Approve Stake";
        } else if (view === 1) {
            return address && hasAllowance("gD33d") ? "Confirm Unstake" : "Approve Unstake";
        }
        return "Confirm Redeem";
    };

    const confirmModalDescription = () => {
        if (view === 0) {
            if (isPendingTxn(pendingTransactions, "staking")) {
                return <span>Staking your D33D...</span>;
            } else if (completed) {
                return (
                    <span>
                        Your D33D has been staked
                        <br />
                        successfully.
                    </span>
                );
            }
        } else if (view === 1) {
            if (isPendingTxn(pendingTransactions, "unstaking")) {
                return <span>Unstaking your D33D...</span>;
            } else if (completed) {
                return (
                    <span>
                        Your D33D has been unstaked
                        <br />
                        successfully.
                    </span>
                );
            }
        } else if (view === 2) {
            if (isPendingTxn(pendingTransactions, "redeeming")) {
                return <span>Redeeming your gD33D...</span>;
            } else if (completed) {
                return (
                    <span>
                        Your gD33D has been Redeemed
                        <br />
                        successfully.
                    </span>
                );
            }
        }
        return <span></span>;
    };

    const confirmModalButtonText = () => {
        if (view === 0) {
            return address && hasAllowance("d33d") ? "Stake" : "Approve";
        } else if (view === 1) {
            return address && hasAllowance("gD33d") ? "Unstake" : "Approve";
        }
        return "Redeem";
    };

    const onConfirmAction = async () => {
        if (completed || transactionInProgress) return;
        if (view === 0) {
            if (address && hasAllowance("d33d")) {
                if (isPendingTxn(pendingTransactions, "staking")) return;
                setTransactionInProgress(true);
                onChangeStake("stake");
            } else {
                if (isPendingTxn(pendingTransactions, "approve_staking")) return;
                setTransactionInProgress(true);
                onSeekApproval("d33d");
            }
        } else if (view === 1) {
            if (address && hasAllowance("gD33d")) {
                if (isPendingTxn(pendingTransactions, "unstaking")) return;
                setTransactionInProgress(true);
                onChangeStake("unstake");
            } else {
                if (isPendingTxn(pendingTransactions, "approve_unstaking")) return;
                setTransactionInProgress(true);
                onSeekApproval("gD33d");
            }
        } else {
            if (isPendingTxn(pendingTransactions, "redeeming")) return;
            setTransactionInProgress(true);
            onRedeemConfirm();
        }
    };

    const trimmedTotalStakedBalance = trim(Number(totalStakedBalance), 2);
    const trimmedgD33dBalance = trim(Number(gD33dBalance), 6);
    const trimmedgD33dRate = trim(gd33dExchangeRate, 4);
    const trimmedStakingAPY = trim(stakingAPY * 100, 1);
    const stakingRebasePercentage = trim(stakingRebase * 100, 4);
    const nextRewardValue = trim((Number(stakingRebasePercentage) / 100) * Number(trimmedgD33dBalance), 6);
    const penaltyTimeRemaining = lockupEndTime > Date.now() / 1000 ? lockupEndTime - Date.now() / 1000 : 0;

    const unstakeData = {
        penalty: 0,
        amount: 0,
    };

    return (
        <div className="stake-view">
            <Zoom in={true}>
                <div className="stake-card">
                    <Grid className="stake-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="stake-card-header">
                                <div className="stake-card-header-title">
                                    <span>D33D Staking (</span>
                                    <img src={MetapolyIcon} />,
                                    <img src={MetapolyIcon} />
                                    <span>)</span>
                                </div>
                            </div>
                        </Grid>

                        <Grid item>
                            <div className="stake-card-metrics">
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={6} lg={6}>
                                        <div className="stake-card-apy">
                                            <p className="stake-card-metrics-title">APY</p>
                                            <p className="stake-card-metrics-value">
                                                {stakingAPY || stakingAPY === 0 ? (
                                                    <>{new Intl.NumberFormat("en-US").format(Number(trimmedStakingAPY))}%</>
                                                ) : (
                                                    <Skeleton width="150px" />
                                                )}
                                            </p>
                                        </div>
                                    </Grid>

                                    <Grid item xs={6} sm={6} md={6} lg={6}>
                                        <div className="stake-card-tvl">
                                            <p className="stake-card-metrics-title">TVL</p>
                                            <p className="stake-card-metrics-value">
                                                {stakingTVL ? (
                                                    new Intl.NumberFormat("en-US", {
                                                        style: "currency",
                                                        currency: "USD",
                                                        maximumFractionDigits: 0,
                                                        minimumFractionDigits: 0,
                                                    }).format(stakingTVL)
                                                ) : (
                                                    <Skeleton width="150px" />
                                                )}
                                            </p>
                                        </div>
                                    </Grid>

                                        {/*<Grid item xs={6} sm={4} md={4} lg={4}>*/}
                                        {/*    <div className="stake-card-index">*/}
                                        {/*        <p className="stake-card-metrics-title">Current Index</p>*/}
                                        {/*        <p className="stake-card-metrics-value">{currentIndex ? <>{trim(Number(currentIndex), 2)} D33D</> : <Skeleton width="150px" />}</p>*/}
                                        {/*    </div>*/}
                                        {/*</Grid>*/}
                                </Grid>
                            </div>
                        </Grid>

                        <div className="stake-card-area">
                            {!address && (
                                <div className="stake-card-wallet-notification">
                                    <div className="stake-card-wallet-connect-btn" onClick={connect}>
                                        <p>Connect Wallet</p>
                                    </div>
                                    <p className="stake-card-wallet-desc-text">Connect your wallet to stake D33D tokens!</p>
                                </div>
                            )}
                            {address && (
                                <div>
                                    <div className="stake-card-action-area">
                                        <div className="stake-card-action-stage-btns-wrap">
                                            <div onClick={changeView(0)} className={classnames("stake-card-action-stage-btn", { active: view === 0 })}>
                                                <p>Stake</p>
                                            </div>
                                            <div onClick={changeView(2)} className={classnames("stake-card-action-stage-btn", { active: view === 2 })}>
                                                <p>Claim</p>
                                            </div>
                                            <div onClick={changeView(1)} className={classnames("stake-card-action-stage-btn", { active: view === 1 })}>
                                                <p>Unstake</p>
                                            </div>
                                        </div>

                                        <div className="stake-card-action-row">
                                            <OutlinedInput
                                                type="number"
                                                placeholder="Amount"
                                                className="stake-card-action-input"
                                                value={view === 2 ? new Decimal(rewardInUSM).toFixed(6) : quantity}
                                                onChange={e => validateAndSetQuantity(e.target.value)}
                                                disabled={view === 2 || view === 1}
                                                labelWidth={0}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        {(view == 0) && (
                                                            <div onClick={setMax} className="stake-card-action-input-btn">
                                                                <p>Max</p>
                                                            </div>
                                                        )}
                                                    </InputAdornment>
                                                }
                                            />
                                        </div>
                                        <div className="stake-card-action-area-error_message">{invalidAmount && <p>Invalid Amount</p>}</div>

                                        {view === 0 && (
                                            <div className="stake-card-tab-panel">
                                                <div className="stake-card-tab-panel-btn" onClick={onClickAction}>
                                                    <p>
                                                        {address && hasAllowance("d33d")
                                                            ? txnButtonText(pendingTransactions, "staking", "Stake")
                                                            : txnButtonText(pendingTransactions, "approve_staking", "Stake")}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {view === 1 && (
                                            <div className="stake-card-tab-panel">
                                                <div className="stake-card-tab-panel-btn" onClick={onClickAction}>
                                                    <p>
                                                        {address && hasAllowance("gD33d")
                                                            ? txnButtonText(pendingTransactions, "unstaking", "Unstake")
                                                            : txnButtonText(pendingTransactions, "approve_unstaking", "Approve")}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {view === 2 && (
                                            <div className="stake-card-tab-panel">
                                                {address && (
                                                    <div className="stake-card-tab-panel-btn" onClick={onClaim}>
                                                        <p>{txnButtonText(pendingTransactions, "redeeming", "Claim")}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="stake-card-action-help-text">
                                            {address && ((!hasAllowance("d33d") && view === 0) || (!hasAllowance("gD33d") && view === 1)) && (
                                                <p>
                                                    Stake D33D and get your voting rights as vD33d and also earn USM Rewards
                                                </p>
                                            )}
                                        </div>

                                        <div className="stake-card-action-help-text">
                                            {address && ( view === 2) && (
                                                <p>
                                                    Claim your USM rewards for your vD33D
                                                </p>
                                            )}
                                        </div>

                                    </div>

                                    <div className="stake-user-data">
                                        <div className="data-row">
                                            <p className="data-row-name">D33D Balance</p>
                                            <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(d33dBalance), 4)} D33D</>}</p>
                                        </div>

                                        <div className="data-row">
                                            <p className="data-row-name">vD33D Balance</p>
                                            <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(gD33dBalance), 4)} vD33D</>}</p>
                                        </div>

                                        {/*<div className="data-row">*/}
                                        {/*    <p className="data-row-name">Redeemable Balance (w/ penalty)</p>*/}
                                        {/*    <p className="data-row-value">*/}
                                        {/*        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(redeemableBalanceWithPenalty), 2)} gD33D</>}*/}
                                        {/*    </p>*/}
                                        {/*</div>*/}

                                        {/*<div className="data-row">*/}
                                        {/*    <p className="data-row-name">Redeemable Balance (no penalty)</p>*/}
                                        {/*    <p className="data-row-value">*/}
                                        {/*        {isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(redeemableBalanceWithoutPenalty), 2)} gD33D</>}*/}
                                        {/*    </p>*/}
                                        {/*</div>*/}

                                        {/*<div className="data-row">*/}
                                        {/*    <p className="data-row-name">Total Staked</p>*/}
                                        {/*    <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trimmedTotalStakedBalance} gD33D</>}</p>*/}
                                        {/*</div>*/}

                                        {/* <div className="data-row">
                                            <p className="data-row-name">Your Staked Balance</p>
                                            <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trimmedgD33dBalance} gD33D</>}</p>
                                        </div>

                                        <div className="data-row">
                                            <p className="data-row-name">Exchange rate</p>
                                            <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>1 gD33D = {trimmedgD33dRate} D33D</>}</p>
                                        </div> */}

                                        {/*<div className="data-row">*/}
                                        {/*    <p className="data-row-name penalty-info">*/}
                                        {/*        <span>Unstake Reward Penalty</span>&nbsp;&nbsp;*/}
                                        {/*        <img*/}
                                        {/*            src={InfoIcon}*/}
                                        {/*            title="Premature unstaking before yield will cause a Unstake Reward Penalty. &#013;Make sure you stake beyond penalty period."*/}
                                        {/*        />*/}
                                        {/*    </p>*/}
                                        {/*    <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(rewardPenaltyPercentage) * 100, 2)}%</>}</p>*/}
                                        {/*</div>*/}

                                        {/*<div className="data-row">*/}
                                        {/*    <p className="data-row-name">Penalty Time Remaining</p>*/}
                                        {/*    <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{penaltyTimeRemaining}s</>}</p>*/}
                                        {/*</div>*/}

                                        {/*<div className="data-row">*/}
                                        {/*    <p className="data-row-name">Next Reward Amount</p>*/}
                                        {/*    <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{nextRewardAmount} D33D</>}</p>*/}
                                        {/*</div>*/}

                                        {/*<div className="data-row">*/}
                                        {/*    <p className="data-row-name">Next Reward Yield</p>*/}
                                        {/*    <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{stakingRebasePercentage}%</>}</p>*/}
                                        {/*</div>*/}

                                        {/*<div className="data-row">*/}
                                        {/*    <p className="data-row-name">ROI (5-Day Rate)</p>*/}
                                        {/*    <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(fiveDayRate) * 100, 4)}%</>}</p>*/}
                                        {/*</div>*/}
                                        <div className="data-row">
                                            <p className="data-row-name">Pending Rewards</p>
                                            <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{trimmedTotalStakedBalance} USM</>}</p>
                                        </div>
                                        <div className="data-row">
                                         <img className="flow-stake-earn-img" src={StakeEarn} alt="" />
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    </Grid>
                </div>
            </Zoom>

            <StakingActionModal
                open={openModal}
                transactionInProgress={transactionInProgress}
                handleClose={handleModalClose}
                value={view === 2 ? new Decimal(redeemableBalanceWithPenalty).toFixed(6) : (quantity || "0")}
                token={view === 0 ? "D33D": "vD33D"}
                title={confirmModalTitle()}
                description={confirmModalDescription()}
                buttonText={confirmModalButtonText()}
                completed={completed}
                event={events(view)}
                stakingTx={stakingTx}
                onClick={onConfirmAction}
                savedAmount={gasFee}
            />
        </div>
    );
}

export default Stake;
