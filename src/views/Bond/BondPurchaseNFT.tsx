import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, OutlinedInput, InputAdornment, Slide, FormControl } from "@material-ui/core";
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
import SelectNFTModal from "./SelectNftModal";

interface IBondPurchaseProps {
    bond: IAllBondData;
    slippage: number;
}

function BondPurchase({ bond, slippage }: IBondPurchaseProps) {
    const dispatch = useDispatch();
    const { provider, address, chainID, checkWrongNetwork } = useWeb3Context();

    const [tokenID, setTokenID] = useState("");
    const [quantity, setQuantity] = useState("");
    const [useEth, setuseEth] = useState(false);

    const [openNftModal, setOpenNftModal] = useState(false);

    const isBondLoading = useSelector<IReduxState, boolean>(state => state.bonding.loading ?? true);

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const vestingPeriod = () => {
        return prettifySeconds(bond.vestingTerm, "day");
    };

    async function onBond() {
        if (await checkWrongNetwork()) return;

        if (quantity === "" || quantity==="0") {
            dispatch(warning({ text: messages.before_minting }));
            //@ts-ignore
        } else if (isNaN(quantity)) {
            dispatch(warning({ text: messages.before_minting }));
        } else if (bond.interestDue > 0 || bond.pendingPayout > 0) {
            const shouldProceed = window.confirm(messages.existing_mint);
            if (shouldProceed) {
                await dispatch(
                    bondAsset({
                        value: tokenID,
                        slippage,
                        bond,
                        networkID: chainID,
                        provider,
                        address,
                        useEth,
                    }),
                );
                clearInput();
            }
        } else {
            await dispatch(
                //@ts-ignore
                bondAsset({
                    value: tokenID,
                    slippage,
                    bond,
                    networkID: chainID,
                    provider,
                    address,
                    useEth,
                }),
            );
            clearInput();
        }
    }

    const clearInput = () => {
        setQuantity("");
    };

    const hasAllowance = useCallback(() => {
        return bond.allowance > 0;
    }, [bond.allowance]);

    const bondDetailsDebounce = useDebounce(quantity, 1000);

    useEffect(() => {
        dispatch(calcBondDetails({ bond, value: quantity, provider, networkID: chainID }));
    }, [bondDetailsDebounce]);

    const onSeekApproval = async () => {
        if (await checkWrongNetwork()) return;

        dispatch(changeApproval({ address, bond, provider, networkID: chainID }));
    };

    const handleCloseNftModal = () => {
        setOpenNftModal(false);
    }

    const onClickSelectNFT = () => {
        setOpenNftModal(true);
    };

    const onSelectedNFT = (tokenId: string) => {
        setOpenNftModal(false);
        setTokenID(tokenId);
        setQuantity("1");
    };

    useEffect(() => {
        if (!bond.bondQuote) {
            setTokenID("");
        }
    }, [bond.bondQuote])

    return (
        <Box display="flex" flexDirection="column">
            <Box display="flex" justifyContent="space-around" flexWrap="wrap">
                <FormControl className="bond-input-wrap" variant="outlined" color="primary" fullWidth>
                    <OutlinedInput
                        placeholder="Select NFT"
                        type="string"
                        value={tokenID}
                        onClick={onClickSelectNFT}
                        labelWidth={0}
                        className="bond-input"
                        readOnly
                    />
                </FormControl>
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
                                    {bond.balance} {bond.displayUnits}
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

            <SelectNFTModal 
                open={openNftModal} 
                handleClose={handleCloseNftModal} 
                collection={bond.getAddressForReserve(chainID)}
                onSelectNFT={onSelectedNFT}
            />
        </Box>
    );
}

export default BondPurchase;
