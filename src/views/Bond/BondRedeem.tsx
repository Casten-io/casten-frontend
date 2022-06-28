import { useSelector, useDispatch } from "react-redux";
import { Box, Slide } from "@material-ui/core";
import { IBondDetails, redeemBond } from "../../store/slices/bond-slice";
import { useWeb3Context } from "../../hooks";
import { trim, prettifySeconds, prettyVestingPeriod } from "../../helpers";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { IAllBondData } from "../../hooks/bonds";
import { IUserBondDetails } from "../../store/slices/account-slice";
import { messages } from "../../constants/messages";
import { warning } from "../../store/slices/messages-slice";
import useBiconomy from "src/hooks/biconomy/useBiconomy";
import { IBiconomySlice } from "src/store/slices/biconomy-slice";
import { useEffect, useState } from "react";
import useGasFee from "src/hooks/biconomy/useGasFee";
import BiconomySave from "src/components/BiconomySave/BiconomySave";

interface IBondRedeem {
    bond: IAllBondData;
}

function BondRedeem({ bond }: IBondRedeem) {
    const dispatch = useDispatch();
    const { provider, address, chainID, checkWrongNetwork } = useWeb3Context();
    const { bondRedemption } = useBiconomy();

    const isBondLoading = useSelector<IReduxState, boolean>(state => state.bonding.loading ?? true);

    const currentBlockTime = useSelector<IReduxState, number>(state => {
        return state.app.currentBlockTime;
    });

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const bondingState = useSelector<IReduxState, IBondDetails>(state => {
        return state.bonding && state.bonding[bond.name];
    });

    const bondDetails = useSelector<IReduxState, IUserBondDetails>(state => {
        return state.account.bonds && state.account.bonds[bond.name];
    });

    const biconomyState = useSelector<IReduxState, IBiconomySlice>(state => {
        return state.biconomy;
    })
    const [gasFee, setGasFee] = useState("");
    const [isTransacting, setIsTransacting] = useState(false);
    const { getRedeemBondGasFee } = useGasFee();
    const error = useSelector<IReduxState, IBiconomySlice>(state => {
        return state.messages.message?.error;
    })
    const messageText = useSelector<IReduxState, string  | undefined >(state => {
        return state.messages.message?.text;
    })
    useEffect(() => {
        if(error!==undefined  || ( messageText !== undefined && messageText === messages.tx_successfully_send)) {
            setGasFee(""); // To reset gas fee when error is thrown
            setIsTransacting(false)
        }
    }, [error,messageText])
    const showSaving = biconomyState !== undefined && 
        biconomyState.happyHour && 
        gasFee !== ""&&
        isTransacting;

    async function onRedeem(autostake: boolean) {
        if (await checkWrongNetwork()) return;

        if (bond.interestDue === 0 || bond.pendingPayout === 0) {
            dispatch(warning({ text: messages.nothing_to_claim }));
            return;
        }

        let biconomyProvider;
        let happyHour = false;
        if(biconomyState!==undefined && biconomyState.happyHour) {
            biconomyProvider = biconomyState.biconomy;
            happyHour = biconomyState.happyHour;
        }

        const estimatedGasFee = await getRedeemBondGasFee(bond, autostake, address);
        setGasFee(estimatedGasFee);
        setIsTransacting(true);

        await bondRedemption({ address, bond, networkID: chainID, provider, autostake, biconomyProvider }, happyHour);

        // await dispatch(redeemBond({ address, bond, networkID: chainID, provider, autostake }));
    }

    const vestingTime = () => {
        if (!bondDetails) {
            return "";
        }
        return prettyVestingPeriod(currentBlockTime, bondDetails.bondMaturationBlock);
    };

    const vestingPeriod = () => {
        return prettifySeconds(bondingState.vestingTerm, "day");
    };

    return (
        <Box display="flex" flexDirection="column">
            <Box display="flex" justifyContent="space-around" flexWrap="wrap">
                <div
                    className="transaction-button bond-approve-btn"
                    onClick={() => {
                        if (isPendingTxn(pendingTransactions, "redeem_bond_" + bond.name)) return;
                        onRedeem(false);
                    }}
                >
                    <p>{txnButtonText(pendingTransactions, "redeem_bond_" + bond.name, "Claim")}</p>
                </div>
                <div
                    className="transaction-button bond-approve-btn"
                    onClick={() => {
                        if (isPendingTxn(pendingTransactions, "redeem_bond_" + bond.name + "_autostake")) return;
                        onRedeem(true);
                    }}
                >
                    <p>{txnButtonText(pendingTransactions, "redeem_bond_" + bond.name + "_autostake", "Claim and Autostake")}</p>
                </div>


                {/** Total Saving Amount */}
                {showSaving&&<div className="transaction-button biconomy"><BiconomySave amount={gasFee}/></div>}
            </Box>

            <Slide direction="right" in={true} mountOnEnter unmountOnExit {...{ timeout: 533 }}>
                <Box className="bond-data">
                    <div className="data-row">
                        <p className="bond-balance-title">Pending Rewards</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.interestDue, 4)} D33D`}</p>
                    </div>
                    <div className="data-row">
                        <p className="bond-balance-title">Claimable Rewards</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.pendingPayout, 4)} D33D`}</p>
                    </div>
                    <div className="data-row">
                        <p className="bond-balance-title">Time until fully vested</p>
                        <p className="price-data bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : vestingTime()}</p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">ROI</p>
                        <p className="bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : `${trim(bond.bondDiscount * 100, 2)}%`}</p>
                    </div>

                    <div className="data-row">
                        <p className="bond-balance-title">Vesting Term</p>
                        <p className="bond-balance-title">{isBondLoading ? <Skeleton width="100px" /> : vestingPeriod()}</p>
                    </div>
                </Box>
            </Slide>
        </Box>
    );
}

export default BondRedeem;
