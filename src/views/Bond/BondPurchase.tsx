import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, OutlinedInput, InputAdornment, Slide, FormControl, Select, MenuItem, InputLabel } from "@material-ui/core";
import { shorten, trim, prettifySeconds } from "../../helpers";
import { changeApproval, bondAsset, calcBondDetails } from "../../store/slices/bond-slice";
import { useWeb3Context } from "../../hooks";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { IAllBondData } from "../../hooks/bonds";
import useDebounce from "../../hooks/debounce";
import { messages } from "../../constants/messages";
import { warning } from "../../store/slices/messages-slice";

import EthIcon from "../../assets/tokens/ETH.e.svg";
import WethIcon from "../../assets/tokens/WETH.e.svg";
import useBiconomy from "src/hooks/biconomy/useBiconomy";
import { IBiconomySlice } from "src/store/slices/biconomy-slice";
import useGasFee from "src/hooks/biconomy/useGasFee";
import BiconomySave from "src/components/BiconomySave/BiconomySave";

interface IBondPurchaseProps {
    bond: IAllBondData;
    slippage: number;
}

function BondPurchase({ bond, slippage }: IBondPurchaseProps) {
    const dispatch = useDispatch();
    const { provider, address, chainID, checkWrongNetwork } = useWeb3Context();

    const [quantity, setQuantity] = useState("");
    const [useEth, setUseEth] = useState(bond.name === 'eth');
    const [gasFee, setGasFee] = useState("");
    const [isTransacting, setIsTransacting] = useState(false);

    const { purchaseBond } = useBiconomy();
    const { getPurchaseBondGasFee } = useGasFee();

    const isBondLoading = useSelector<IReduxState, boolean>(state => state.bonding.loading ?? true);

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const biconomyState = useSelector<IReduxState, IBiconomySlice>(state => {
        return state.biconomy;
    })
    const error = useSelector<IReduxState, boolean>(state => {
        return state.messages.message?.error;
    })
    const messageText = useSelector<IReduxState, string  | undefined >(state => {
        return state.messages.message?.text;
    })
   
    useEffect(() => {
        if(error!==undefined || ( messageText !== undefined && messageText === messages.tx_successfully_send) ) {
            setGasFee(""); // To reset gas fee when error is thrown
            setIsTransacting(false);
        }
    }, [error, messageText])
    const showSaving = biconomyState !== undefined && 
        biconomyState.happyHour && 
        gasFee !== "" && 
        isTransacting;

    const vestingPeriod = () => {
        return prettifySeconds(bond.vestingTerm, "day");
    };

    async function onBond() {
        if (await checkWrongNetwork()) return;

        let biconomyProvider;
        let happyHour = false;
        if(biconomyState!==undefined && biconomyState.happyHour) {
            biconomyProvider = biconomyState.biconomy;
            happyHour = biconomyState.happyHour;
        }

        if (quantity === "") {
            dispatch(warning({ text: messages.before_minting }));
            //@ts-ignore
        } else if (isNaN(quantity)) {
            dispatch(warning({ text: messages.before_minting }));
        } else if (bond.interestDue > 0 || bond.pendingPayout > 0) {
            const shouldProceed = window.confirm(messages.existing_mint);
            if (shouldProceed) {
                const trimBalance = trim(Number(quantity), 10);

                const estimatedGasFee = await getPurchaseBondGasFee( bond, trimBalance, address, slippage, useEth);
                setGasFee(estimatedGasFee);
                setIsTransacting(true);

                await purchaseBond({
                    value: trimBalance,
                    slippage,
                    bond,
                    networkID: chainID,
                    provider,
                    address,
                    useEth,
                    biconomyProvider
                }, happyHour)

                // await dispatch(
                //     bondAsset({
                //         value: trimBalance,
                //         slippage,
                //         bond,
                //         networkID: chainID,
                //         provider,
                //         address,
                //         useEth,
                //     }),
                // );

                
                clearInput();
            }
        } else {
            const trimBalance = trim(Number(quantity), 10);

            const estimatedGasFee = await getPurchaseBondGasFee( bond, trimBalance, address, slippage, useEth);
            setGasFee(estimatedGasFee);

            await purchaseBond({
                value: trimBalance,
                slippage,
                bond,
                networkID: chainID,
                provider,
                address,
                useEth,
                biconomyProvider
            }, happyHour)

            // await dispatch(
            //     //@ts-ignore
            //     bondAsset({
            //         value: trimBalance,
            //         slippage,
            //         bond,
            //         networkID: chainID,
            //         provider,
            //         address,
            //         useEth,
            //     }),
            // );
            clearInput();
        }
    }

    const clearInput = () => {
        setQuantity("");
    };

    const hasAllowance = useCallback(() => {
        return bond.allowance > 0;
    }, [bond.allowance]);

    const setMax = () => {
        let amount: any = Math.min(bond.maxBondPriceToken * 0.9999, useEth ? bond.ethBalance * 0.99 : bond.balance);

        if (amount) {
            amount = trim(amount);
        }

        setQuantity((amount || "").toString());
    };

    const bondDetailsDebounce = useDebounce(quantity, 1000);

    useEffect(() => {
        dispatch(calcBondDetails({ bond, value: quantity, provider, networkID: chainID }));
    }, [bondDetailsDebounce]);

    const onSeekApproval = async () => {
        if (await checkWrongNetwork()) return;

        dispatch(changeApproval({ address, bond, provider, networkID: chainID }));
    };

    const displayUnits = useEth ? "ETH" : bond.displayUnits;

    return (
        <Box display="flex" flexDirection="column">
            <Box display="flex" justifyContent="space-around" flexWrap="wrap">
                <FormControl className="bond-input-wrap" variant="outlined" color="primary" fullWidth>
                    <OutlinedInput
                        placeholder="Amount"
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        labelWidth={0}
                        className="bond-input"
                        endAdornment={
                            <div className="bond-input-controller">
                                {bond.name === "eth" && (
                                    <Select
                                        className="eth-select"
                                        value={useEth ? 1 : 0}
                                        onChange={(e) => setUseEth(!!e.target.value)}
                                        autoWidth
                                    >
                                        <MenuItem value={1} className="eth-select-item"><img src={EthIcon} width="18" alt="ETH" />&nbsp;ETH</MenuItem>
                                        <MenuItem value={0} className="eth-select-item"><img src={WethIcon} width="18" alt="ETH" />&nbsp;WETH</MenuItem>
                                    </Select>
                                )}
                                <InputAdornment position="end">
                                    <div className="stake-input-btn" onClick={setMax}>
                                        <p>Max</p>
                                    </div>
                                </InputAdornment>
                            </div>
                        }
                        fullWidth
                    />
                </FormControl>

                {/** Total Saving Amount */}
                <div className="bond-input-wrap" style={{width: "100%"}}>
                    {showSaving&&<BiconomySave amount={gasFee}/>}
                </div>

                {hasAllowance() || useEth ? (
                    <div
                        className="transaction-button bond-approve-btn"
                        onClick={async () => {
                            if (isPendingTxn(pendingTransactions, "bond_" + bond.name)) return;
                            await onBond();
                        }}
                    >
                        <p>{txnButtonText(pendingTransactions, "bond_" + bond.name, "Bond")}</p>
                    </div>
                ) : (
                    <div
                        className="transaction-button bond-approve-btn"
                        onClick={async () => {
                            if (isPendingTxn(pendingTransactions, "approve_" + bond.name)) return;
                            await onSeekApproval();
                        }}
                    >
                        <p>{txnButtonText(pendingTransactions, "approve_" + bond.name, "Approve")}</p>
                    </div>
                )}

                {!hasAllowance() && !useEth && (
                    <div className="help-text">
                        <p className="help-text-desc">
                            Note: The "Approve" transaction is only needed when bonding for the first time; <br />
                            subsequent bonding only requires you to perform the "Bond" transaction.
                        </p>
                    </div>
                )}
            </Box>

            <Slide direction="left" in={true} mountOnEnter unmountOnExit {...{ timeout: 533 }}>
                <Box className="bond-data">
                    <div className="data-row">
                        <p className="bond-balance-title">Your Balance</p>
                        <p className="bond-balance-title">
                            {isBondLoading ? (
                                <Skeleton width="100px" />
                            ) : (
                                <>
                                    {trim(useEth ? bond.ethBalance : bond.balance, 4)} {displayUnits}
                                </>
                            )}
                        </p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">You Will Get</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.bondQuote, 4)} D33D`}</p>
                    </div>

                    {/* <div className={`data-row`}>
                        <p className="bond-balance-title">Max You Can Buy</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.maxBondPrice, 4)} D33D`}</p>
                    </div> */}

                    <div className="data-row">
                        <p className="bond-balance-title">ROI</p>
                        <p className="bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.bondDiscount * 100, 2)}%`}</p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">Vesting Term</p>
                        <p className="bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : vestingPeriod()}</p>
                    </div>

                    {/* <div className="data-row">
                        <p className="bond-balance-title">Minimum purchase</p>
                        <p className="bond-balance-title">0.01 D33D</p>
                    </div> */}
                </Box>
            </Slide>
        </Box>
    );
}

export default BondPurchase;
