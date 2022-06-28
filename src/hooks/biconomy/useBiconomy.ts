import { useCallback } from "react";
import { Biconomy } from "@biconomy/mexa";
import { useDispatch } from "react-redux";
import { getBiconomyEvent } from "../../services/event";
import { saveHappyHourInfo } from "src/store/slices/biconomy-slice";
import { getPd33dBalances, IRedeemToken, redeemToken } from "src/store/slices/convert-slice";
import { getMintBalances, IMintToken, mintToken } from "src/store/slices/mint-slice";
import { BigNumber, ContractInterface, ethers } from "ethers";
import { getAddresses, signatureType } from "src/constants";
import { RedeemContract, StakingContract, USMMintContract } from "src/abi";
import { fetchPendingTxns, clearPendingTxn, getStakingTypeText } from "src/store/slices/pending-txns-slice";
import { info, success } from "src/store/slices/messages-slice";
import { messages } from "src/constants/messages";
import { sleep } from "src/helpers";
import { useWeb3Context } from "..";
import { bondAsset, IBondAsset, IRedeemBond, redeemBond } from "src/store/slices/bond-slice";
import { calculateUserBondDetails, getBalances, loadAccountDetails } from "src/store/slices/account-slice";
import { metamaskErrorWrap } from "src/helpers/metamask-error-wrap";
import { changeStake, IChangeStake, IRedeem, redeem } from "src/store/slices/stake-thunk";

function useBiconomy() {
    const dispatch = useDispatch();
    const { provider: currentProvider, address: account, chainID } = useWeb3Context();

    const biconomyKey = process.env.REACT_APP_BICONOMY_KEY;
    const biconomyDebugEnabled = process.env.REACT_APP_BICONOMY_DEBUG_ENABLED;

    const checkOngoingEvent = useCallback(async () => {
        try {
            const result = await getBiconomyEvent();

            if (result.data === undefined) {
                throw new Error(`Data is undefined.`);
            }

            const { happyHour, happyHourInfo } = result.data;

            // There's an ongoing happy hour event
            if (happyHour && happyHourInfo !== null) {
                // Instantiate Biconomy
                const biconomy = new Biconomy(currentProvider, {
                    apiKey: biconomyKey,
                    walletProvider: window.ethereum,
                    debug: biconomyDebugEnabled,
                });

                biconomy
                    .onEvent(biconomy.READY, () => {
                        console.log(`Successfully connected to biconomy`);
                        const signer = biconomy.getSignerByAddress(account);

                        dispatch(
                            saveHappyHourInfo({
                                eventInfo: happyHourInfo,
                                happyHour,
                                biconomy,
                                signer,
                            }),
                        );
                    })
                    .onEvent(biconomy.ERROR, (error: any) => {
                        console.log(error);
                    });
            }
        } catch (err) {
            console.error(`Error checkOngoingEvent(): `, err);
        }
    }, []);

    // Initiate Contract
    const initiateContract = async (address: string, abi: ContractInterface, provider: any, isHappyHour?: boolean) => {
        const signer = isHappyHour ? provider.getSignerByAddress(account) : provider.getSigner();
        return new ethers.Contract(address, abi, signer);
    };

    // Redeem PD33D
    const redeemP33D = useCallback(async (actionParam: IRedeemToken, isHappyHour: boolean = false) => {
        if (isHappyHour === false) {
            dispatch(redeemToken(actionParam));
            return;
        }

        let { networkID, amount, provider, biconomyProvider = undefined, signature = [], stake } = actionParam;

        try {
            const addresses = getAddresses(networkID);
            const contractAddress = addresses.REDEEM_ADDRESS;
            const currProvider = isHappyHour ? biconomyProvider : provider;
            const contract = await initiateContract(contractAddress, RedeemContract, currProvider, isHappyHour);

            let { data } = await contract.populateTransaction.redeem(ethers.utils.parseUnits(amount), signature, stake);
            let txParams = { data: data, to: contractAddress, from: account };

            if (isHappyHour && biconomyProvider !== undefined) {
                txParams = { ...txParams, ...{ signatureType } }; // To pass signature type
                provider = biconomyProvider.getEthersProvider();
            }

            let txHash = await provider.send("eth_sendTransaction", [txParams]);

            dispatch(
                fetchPendingTxns({
                    txnHash: txHash,
                    text: "Converting",
                    type: "pD33D to D33D",
                }),
            );

            provider.once(txHash, async (transaction: any) => {
                dispatch(success({ text: messages.tx_successfully_send }));
                await sleep(2);
                dispatch(clearPendingTxn(transaction.transactionHash));
                dispatch(getPd33dBalances({ address: account, networkID: chainID, provider }));
            });
        } catch (err) {
            console.log(`Error: `, err);
        }
    }, []);

    // Mint USM
    const mintUSMToken = useCallback(async (actionParam: IMintToken, isHappyHour: boolean = false) => {
        if (isHappyHour === false) {
            dispatch(mintToken(actionParam));
            return;
        }

        let { networkID, amount, provider, biconomyProvider = undefined, token } = actionParam;

        try {
            const addresses = getAddresses(networkID);
            const contractAddress = addresses.USM_MINTER;
            const dvdAddress = addresses.DVD_ADDRESS;
            const d33dAddress = addresses.D33D_ADDRESS;
            const currProvider = isHappyHour ? biconomyProvider : provider;
            const contract = await initiateContract(contractAddress, USMMintContract, currProvider, isHappyHour);

            let { data } =
                token === 1
                    ? await contract.populateTransaction.mintWithD33d(ethers.utils.parseUnits(amount), d33dAddress)
                    : await contract.populateTransaction.mintWithDvd(ethers.utils.parseUnits(amount), dvdAddress);
            let txParams = { data: data, to: contractAddress, from: account };

            if (isHappyHour && biconomyProvider !== undefined) {
                txParams = { ...txParams, ...{ signatureType } }; // To pass signature type
                provider = biconomyProvider.getEthersProvider();
            }

            let txHash = await provider.send("eth_sendTransaction", [txParams]);
            const tokenName = token === 1 ? "D33D" : "DVD";
            dispatch(
                fetchPendingTxns({
                    txnHash: txHash,
                    text: "Minting",
                    type: `${tokenName} to D33D`,
                }),
            );

            provider.once(txHash, async (transaction: any) => {
                dispatch(success({ text: messages.tx_successfully_send }));
                await sleep(2);
                dispatch(clearPendingTxn(transaction.transactionHash));
                dispatch(getMintBalances({ address: account, networkID: chainID, provider }));
            });
        } catch (err) {
            console.log(`Error: `, err);
        }
    }, []);

    // Purchase Bond
    const purchaseBond = useCallback(async (actionParam: IBondAsset, isHappyHour: boolean = false) => {
        let { value, address, bond, networkID, provider, slippage, useEth, biconomyProvider = undefined } = actionParam;

        if (isHappyHour === false || useEth) {
            dispatch(bondAsset(actionParam));
            return;
        }

        try {
            const depositorAddress = address;
            const acceptedSlippage = slippage / 100 || 0.005;
            // If is happy hour, then use biconomyProvider's signer
            const signer = isHappyHour ? biconomyProvider.getSignerByAddress(address) : provider.getSigner();
            const bondContract = bond.getContractForBond(networkID, signer);
            const contractAddress = bond.getAddressForBond(networkID);

            const calculatePremium = await bondContract.bondPrice();
            const maxPremium = Math.round(calculatePremium * (1 + acceptedSlippage));

            let bondTx;
            if (!bond.isNFT) {
                const _value = Number(value) * 10000; // for decimal values, like 0.05 eth
                const valueInWei = BigNumber.from(_value)
                    .mul(BigNumber.from(10).pow(BigNumber.from(bond.reserveDecimals)))
                    .div(BigNumber.from(10000));

                if (useEth) {
                    bondTx = await bondContract.populateTransaction.deposit(valueInWei.toString(), maxPremium.toString(), depositorAddress, { value: valueInWei.toString() });
                } else {
                    bondTx = await bondContract.populateTransaction.deposit(valueInWei.toString(), maxPremium.toString(), depositorAddress);
                }
            } else {
                // value is token id
                bondTx = await bondContract.populateTransaction.deposit(value, maxPremium.toString(), depositorAddress);
            }

            let { data } = bondTx;
            let txParams = { data: data, to: contractAddress, from: account };

            if (isHappyHour && biconomyProvider !== undefined) {
                txParams = { ...txParams, ...{ signatureType } }; // To pass signature type
                provider = biconomyProvider.getEthersProvider();
            }

            let txHash = await provider.send("eth_sendTransaction", [txParams]);

            dispatch(
                fetchPendingTxns({
                    txnHash: txHash,
                    text: "Bonding " + bond.displayName,
                    type: "bond_" + bond.name,
                }),
            );

            provider.once(txHash, async (transaction: any) => {
                console.log(`transaction`, transaction);
                console.log(`transaction used`, transaction.gasUsed.toString(), transaction.effectiveGasPrice.toString(), transaction.cumulativeGasUsed.toString());
                dispatch(success({ text: messages.tx_successfully_send }));
                dispatch(info({ text: messages.your_balance_update_soon }));
                await sleep(2);
                await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
                dispatch(info({ text: messages.your_balance_updated }));
                dispatch(clearPendingTxn(transaction.transactionHash));
            });
        } catch (err) {
            console.log(`Error: `, err);
            return metamaskErrorWrap(err, dispatch);
        }
    }, []);

    // Redeem Bond
    const bondRedemption = useCallback(async (actionParam: IRedeemBond, isHappyHour: boolean = false) => {
        if (isHappyHour === false) {
            dispatch(redeemBond(actionParam));
            return;
        }

        let { address, bond, networkID, provider, autostake, biconomyProvider } = actionParam;
        const signer = isHappyHour ? biconomyProvider.getSignerByAddress(address) : provider.getSigner();
        const bondContract = bond.getContractForBond(networkID, signer);
        const contractAddress = bond.getAddressForBond(networkID);

        try {
            let { data } = await bondContract.populateTransaction.redeem(address, autostake === true);
            let txParams = { data: data, to: contractAddress, from: account };

            if (isHappyHour && biconomyProvider !== undefined) {
                txParams = { ...txParams, ...{ signatureType } }; // To pass signature type
                provider = biconomyProvider.getEthersProvider();
            }

            let txHash = await provider.send("eth_sendTransaction", [txParams]);

            const pendingTxnType = "redeem_bond_" + bond.name + (autostake === true ? "_autostake" : "");

            dispatch(
                fetchPendingTxns({
                    txnHash: txHash,
                    text: "Redeeming " + bond.displayName,
                    type: pendingTxnType,
                }),
            );

            provider.once(txHash, async (transaction: any) => {
                dispatch(success({ text: messages.tx_successfully_send }));
                dispatch(info({ text: messages.your_balance_update_soon }));
                await sleep(2);
                await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
                await dispatch(getBalances({ address, networkID, provider }));
                dispatch(info({ text: messages.your_balance_updated }));
                dispatch(clearPendingTxn(transaction.transactionHash));
            });
        } catch (err) {
            console.log(`Error: `, err);
            return metamaskErrorWrap(err, dispatch);
        }
    }, []);

    // Staking
    const stakeD33D = useCallback(async (actionParam: IChangeStake, isHappyHour: boolean = false) => {
        let { action, value, provider, address, networkID, biconomyProvider } = actionParam;

        // Only applies for stake action and happy hour
        if (!isHappyHour || action !== "stake") {
            // Forward to function in stake-thunk.ts
            await dispatch(changeStake(actionParam));
            await dispatch(loadAccountDetails({ address, networkID, provider }));
            return;
        }

        const addresses = getAddresses(networkID);
        const contractAddress = addresses.STAKING_ADDRESS;
        const signer = isHappyHour ? biconomyProvider.getSignerByAddress(address) : provider.getSigner();
        const staking = new ethers.Contract(contractAddress, StakingContract, signer);

        try {
            let { data } = await staking.populateTransaction.stake(ethers.utils.parseUnits(value), address);
            let txParams = { data: data, to: contractAddress, from: account };

            if (isHappyHour && biconomyProvider !== undefined) {
                txParams = { ...txParams, ...{ signatureType } }; // To pass signature type
                provider = biconomyProvider.getEthersProvider();
            }

            let txHash = await provider.send("eth_sendTransaction", [txParams]);

            const pendingTxnType = action === "stake" ? "staking" : action === "unstake" ? "unstaking" : "redeeming";
            dispatch(
                fetchPendingTxns({
                    txnHash: txHash,
                    text: getStakingTypeText(action),
                    type: pendingTxnType,
                }),
            );

            provider.once(txHash, async (transaction: any) => {
                dispatch(success({ text: messages.tx_successfully_send }));
                dispatch(info({ text: messages.your_balance_update_soon }));
                await sleep(2);
                await dispatch(getBalances({ address, networkID, provider }));
                dispatch(info({ text: messages.your_balance_updated }));
                dispatch(clearPendingTxn(transaction.transactionHash));
            });
        } catch (err) {
            console.log(`Error: `, err);
            return metamaskErrorWrap(err, dispatch);
        }
    }, []);

    // Stake Redeem
    const claimRewards = useCallback(async (actionParam: IRedeem, isHappyHour: boolean = false) => {
        let { action, provider, networkID, biconomyProvider } = actionParam;

        // Only applies for happy hour
        if (!isHappyHour) {
            // Forward to function in stake-thunk.ts
            dispatch(redeem(actionParam));
            return;
        }

        const addresses = getAddresses(networkID);
        const contractAddress = addresses.STAKING_ADDRESS;
        const signer = isHappyHour ? biconomyProvider.getSignerByAddress(account) : provider.getSigner();
        const staking = new ethers.Contract(contractAddress, StakingContract, signer);

        try {
            let { data } = await staking.populateTransaction.claimRewards();
            let txParams = { data: data, to: contractAddress, from: account };

            if (isHappyHour && biconomyProvider !== undefined) {
                txParams = { ...txParams, ...{ signatureType } }; // To pass signature type
                provider = biconomyProvider.getEthersProvider();
            }

            let txHash = await provider.send("eth_sendTransaction", [txParams]);

            dispatch(
                fetchPendingTxns({
                    txnHash: txHash,
                    text: getStakingTypeText(action),
                    type: "redeeming",
                }),
            );

            provider.once(txHash, async (transaction: any) => {
                dispatch(success({ text: messages.tx_successfully_send }));
                dispatch(info({ text: messages.your_balance_update_soon }));
                await sleep(2);
                await dispatch(getBalances({ address: account, networkID, provider }));
                dispatch(info({ text: messages.your_balance_updated }));
                dispatch(clearPendingTxn(transaction.transactionHash));
            });
        } catch (err) {
            console.log(`Error: `, err);
            return metamaskErrorWrap(err, dispatch);
        }
    }, []);

    return {
        checkOngoingEvent,
        redeemP33D,
        purchaseBond,
        bondRedemption,
        stakeD33D,
        claimRewards,
        mintUSMToken,
    };
}

export default useBiconomy;
