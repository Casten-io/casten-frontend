import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useWeb3Context } from "../../hooks";
import { Grid, InputAdornment, OutlinedInput, Backdrop, Zoom, Slider, Fade, Box } from "@material-ui/core";
import { IReduxState } from "../../store/slices/state.interface";
import { trim } from "../../helpers";
import { Skeleton } from "@material-ui/lab";
import USMIcon from "../../assets/icons/$USM.png";
import DVD from "../../assets/icons/DVD.svg";
import D33D from "../../assets/icons/metapoly-home.svg";
import "./mint.scss";
import { IPendingTxn, isPendingTxn, txnButtonText, getPendingTransInfo } from "../../store/slices/pending-txns-slice";
import { tokenApprove, getMintBalances } from "../../store/slices/mint-slice";
import MintActionModal from "./MintActionModal";
import { IBiconomySlice } from "src/store/slices/biconomy-slice";
import useGasFee from "src/hooks/biconomy/useGasFee";
import useBiconomy from "src/hooks/biconomy/useBiconomy";
import HappyHourTag from "src/components/HappyHourTag/HappyHourTag";
import { warning } from "../../store/slices/messages-slice";
import { getAddresses } from "../../constants";

function Mint() {
    const dispatch = useDispatch();
    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();
    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const [quantity, setQuantity] = useState<string>("");
    const [token, setToken] = useState<number>(1);
    const [openCoinSelection, SetOpenCoinSelecting] = useState(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
    const [completed, setCompleted] = useState<boolean>(false);
    const [mintTx, setMintTx] = useState<string>("");
    const [gasFee, setGasFee] = useState<string>("");
    const { mintUSMToken } = useBiconomy();
    const { getMintUSM } = useGasFee();
    const addresses = getAddresses(4);
    const USMToken = addresses.USM_ADDREESS;

    const d33dBalance = useSelector<IReduxState, string>(state => {
        return state.mint.balances && state.mint.balances.d33d;
    });

    const usmBalance = useSelector<IReduxState, string>(state => {
        return state.mint.balances && state.mint.balances.usm;
    });

    const dvdBalance = useSelector<IReduxState, string>(state => {
        return state.mint.balances && state.mint.balances.dvd;
    });

    const allowanceD33d = useSelector<IReduxState, string>(state => {
        return state.mint.allowances && state.mint.allowances.d33d;
    });

    const allowanceDvd = useSelector<IReduxState, string>(state => {
        return state.mint.allowances && state.mint.allowances.dvd;
    });

    const dvdMaxAmount = useSelector<IReduxState, string>(state => {
        return state.mint.maxAmounts && state.mint.maxAmounts.dvd;
    });

    const d33dMaxAmount = useSelector<IReduxState, string>(state => {
        return state.mint.maxAmounts && state.mint.maxAmounts.d33d;
    });

    const biconomyState = useSelector<IReduxState, IBiconomySlice>(state => {
        return state.biconomy;
    });

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const messageTxt = useSelector<IReduxState, string | null>(state => {
        return state.messages.message && state.messages.message.severity;
    });

    const mintPendingTransaction = getPendingTransInfo(pendingTransactions, "mint");
    if (mintPendingTransaction) {
        setMintTx(mintPendingTransaction.txnHash);
    }

    useEffect(() => {
        if (messageTxt === "success") {
            setCompleted(true);
            setTransactionInProgress(false);
        }
    }, [messageTxt]);

    const isApprovalGranted = (tokenName: string) => {
        if (tokenName === "D33D") {
            return Number(allowanceD33d) > 0;
        } else if (tokenName === "DVD") {
            return Number(allowanceDvd) > 0;
        }
    };

    const handleModalClose = () => {
        setQuantity("");
        setCompleted(false);
        setOpenModal(false);
        dispatch(getMintBalances);
    };

    const onClickAction = async () => {
        const quantity_ = Number(quantity);

        if (!quantity_) {
            return dispatch(warning({ text: "Invalid amount!" }));
        }

        if (isApprovalGranted(token === 1 ? "D33D" : "DVD") && biconomyState !== undefined && biconomyState.happyHour) {
            const expectedGasFee = await getMintUSM(quantity, token, address);
            if (expectedGasFee) {
                setGasFee(expectedGasFee);
            }
        }

        setCompleted(false);
        setOpenModal(true);
    };

    const onConfirmAction = async () => {
        if (completed || transactionInProgress) return;

        const tokenName = token === 1 ? "D33D" : "DVD";

        if (address && isApprovalGranted(tokenName)) {
            if (isPendingTxn(pendingTransactions, "mint")) return;
            setTransactionInProgress(true);
            onRequestMint(quantity, token);
        } else {
            if (isPendingTxn(pendingTransactions, "approve_mint")) return;
            setTransactionInProgress(true);
            onRequestApprove(token);
        }
    };

    const isMintEvent = () => {
        if (token === 1 && Number(allowanceD33d) > 0) {
            return true;
        }
        if (token === 2 && Number(allowanceDvd) > 0) {
            return true;
        }
        return false;
    };

    const confirmModalTitle = () => {
        const tokenName = token === 1 ? "D33D" : "DVD";

        if (isMintEvent()) {
            return "Mint";
        }
        return "Approve " + tokenName;
    };

    const confirmButtonText = () => {
        if (isMintEvent()) {
            return "Mint";
        }
        return "Approve ";
    };

    const confirmModalDescription = () => {
        // if(){

        // }
        if (isPendingTxn(pendingTransactions, "staking")) {
            return <span>Minting your U$M...</span>;
        } else if (completed) {
            return (
                <span>
                    Your U$M has been minted
                    <br />
                    successfully.
                </span>
            );
        }

        return <span></span>;
    };

    const onRequestMint = async (amount: string, token: number) => {
        if (await checkWrongNetwork()) return;
        // await dispatch(redeemToken({ provider, address, networkID: chainID, amount, signature }));

        let biconomyProvider;
        let happyHour = false;
        if (biconomyState !== undefined && biconomyState.happyHour) {
            biconomyProvider = biconomyState.biconomy;
            happyHour = biconomyState.happyHour;
        }

        await mintUSMToken({ provider, biconomyProvider, address, networkID: chainID, amount, token }, happyHour);
    };

    const onRequestApprove = async (token: number) => {
        if (await checkWrongNetwork()) return;
        await dispatch(tokenApprove({ provider, address, networkID: chainID, token }));
    };

    const handleCoinSelected = (index: number) => {
        setToken(index);
        SetOpenCoinSelecting(false);
        setQuantity("");
    };

    const setMax = () => {
        const maxAmount = findAllowance(token);
        setQuantity(String(trim(Number(maxAmount), 4)));
    };

    const findAllowance = (id: number) => {
        if (id === 1) {
            return d33dBalance;
        } else {
            return dvdBalance;
        }
    };

    return (
        <div className="mint-view">
            <Zoom in={true}>
                <div className="mint-card">
                    <HappyHourTag />
                    <Grid className="mint-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="mint-card-header">
                                <div className="mint-card-header-title">
                                    <img src={USMIcon}></img>&nbsp;
                                    <span>U$M MINT</span>
                                </div>
                            </div>
                        </Grid>
                        <Grid item>
                            <div className="mint-card-description">
                                <span>Mint or redeem your U$M using D33D or DVD</span>
                            </div>
                        </Grid>
                    </Grid>
                    <Grid className="mint-card-grid" container direction="column" spacing={2}>
                        {!address && (
                            <div className="mint-card-wallet-notification">
                                <div className="mint-card-wallet-connect-btn" onClick={connect}>
                                    <p>Connect Wallet</p>
                                </div>
                                <p className="mint-card-wallet-desc-text">Connect your wallet to claim D33D tokens!</p>
                            </div>
                        )}
                        {address && (
                            <div>
                                <div className="mint-balances">
                                    <Grid container className="mint-balances-area">
                                        <Grid item xs={12} className="mint-balances-area-heading">
                                            <p className="mint-balances-text">Your Balances</p>
                                        </Grid>
                                        <Grid item xs={4} className="mint-balances-three-col">
                                            <img className="mint-balances-text-logo" src={DVD}></img>&nbsp;
                                            <span className="mint-balances-text-symbol">DVD</span>&nbsp;
                                            <span className="mint-balances-text-balance">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(dvdBalance), 4)}</>}</span>
                                        </Grid>
                                        <Grid item xs={4} className="mint-balances-three-col">
                                            <img className="mint-balances-text-logo" src={D33D}></img>&nbsp;
                                            <span className="mint-balances-text-symbol">D33D</span>&nbsp;
                                            <span className="mint-balances-text-balance">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(d33dBalance), 4)}</>}</span>
                                        </Grid>
                                        <Grid item xs={4} className="mint-balances-three-col">
                                            <img className="mint-balances-text-logo" src={USMIcon}></img>&nbsp;
                                            <span className="mint-balances-text-symbol">U$M</span>&nbsp;
                                            <span className="mint-balances-text-balance">{isAppLoading ? <Skeleton width="80px" /> : <>{trim(Number(usmBalance), 4)}</>}</span>
                                        </Grid>
                                    </Grid>
                                </div>
                                <Grid container className="mint-card-action-area">
                                    <div className="mint-card-action-row">
                                        <OutlinedInput
                                            type="number"
                                            placeholder="Amount"
                                            className="mint-card-action-input"
                                            value={quantity}
                                            onChange={e => {
                                                setQuantity(e.target.value);
                                            }}
                                            labelWidth={0}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <div onClick={setMax} className="mint-card-action-input-btn">
                                                        <p>Max</p>
                                                    </div>
                                                </InputAdornment>
                                            }
                                        />
                                    </div>
                                    <Grid className="mint-card-action-currency" onClick={() => SetOpenCoinSelecting(!openCoinSelection)}>
                                        <img src={token === 1 ? D33D : DVD} className="mint-balances-text-logo-one" alt="" />

                                        {token === 1 ? <span className="mint-balances-dropdown-symbol">D33D</span> : <span className="mint-balances-dropdown-symbol">DVD</span>}
                                        {openCoinSelection && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    width: "14.5%",
                                                    bgcolor: "#f7f7f7",
                                                    zIndex: 5,
                                                    marginTop: "5rem",
                                                    border: "2px solid #dddddd",
                                                    borderTop: "none",
                                                }}
                                            >
                                                <Box onClick={() => handleCoinSelected(1)} key={"D33D"} sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                                                    <Box>
                                                        <img src={D33D} className="mint-balances-text-logo-one" alt="" />
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            marginLeft: "8px",
                                                        }}
                                                    >
                                                        <span className="mint-balances-dropdown-symbol">D33D</span>
                                                    </Box>
                                                </Box>
                                                <Box onClick={() => handleCoinSelected(2)} key={"DVD"} sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                                                    <Box>
                                                        <img src={DVD} className="mint-balances-text-logo-one" alt="" />
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            marginLeft: "8px",
                                                        }}
                                                    >
                                                        <span className="mint-balances-dropdown-symbol">DVD</span>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}
                                    </Grid>

                                    <Grid item xs={12}>
                                        <div className="mint-card-tab-panel">
                                            {address && isApprovalGranted(token === 1 ? "D33D" : "DVD") ? (
                                                <div
                                                    className="mint-card-tab-panel-btn"
                                                    onClick={() => {
                                                        onClickAction();
                                                    }}
                                                >
                                                    <p>{txnButtonText(pendingTransactions, "preform_minting", "Mint")}</p>
                                                </div>
                                            ) : (
                                                <div
                                                    className="mint-card-tab-panel-btn"
                                                    onClick={() => {
                                                        onRequestApprove(token);
                                                    }}
                                                >
                                                    <p>{txnButtonText(pendingTransactions, "approve_minting", "Approve")}</p>
                                                </div>
                                            )}
                                        </div>
                                    </Grid>
                                    <div className="mint-card-action-help-text">
                                        {address && (
                                            <p>
                                                Note: The "Approve" transaction is only needed when staking/unstaking for the first subsequent staking/unstaking only requires you
                                                to perform the "Stake" or "Unstake" transaction.
                                            </p>
                                        )}
                                    </div>
                                    <div className="mint-card-action-info">
                                        {address && (
                                            <p className="mint-card-action-info-para">
                                                {" "}
                                                {isAppLoading ? (
                                                    <Skeleton width="80px" />
                                                ) : (
                                                    <>
                                                        You can mint{" "}
                                                        <span className="stylized-amount">{token === 1 ? trim(Number(d33dMaxAmount), 4) : trim(Number(dvdMaxAmount), 4)}</span> USM
                                                    </>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </Grid>
                            </div>
                        )}
                    </Grid>
                </div>
            </Zoom>
            <MintActionModal
                open={openModal}
                transactionInProgress={transactionInProgress}
                handleClose={handleModalClose}
                value={quantity}
                token={token === 1 ? "D33D" : "DVD"}
                mintTo={"USM"}
                title={confirmModalTitle()}
                description={confirmModalDescription()}
                buttonText={confirmButtonText()}
                completed={completed}
                onClick={onConfirmAction}
                savedAmount={gasFee}
                mintTx={mintTx}
            />
        </div>
    );
}

export default Mint;
