import { ethers } from "ethers";
import { getAddresses } from "../../constants";
import { StakingHelperContract, D33DTokenContract, gD33DTokenContract, StakingContract } from "../../abi";
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "./pending-txns-slice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountSuccess, getBalances } from "./account-slice";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Networks } from "../../constants/blockchain";
import { warning, success, info, error } from "../../store/slices/messages-slice";
import { messages } from "../../constants/messages";
import { getGasPrice } from "../../helpers/get-gas-price";
import { metamaskErrorWrap } from "../../helpers/metamask-error-wrap";
import { sleep } from "../../helpers";
import { RootState } from "../store";

interface IChangeApproval {
    token: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
}

export const changeApproval = createAsyncThunk("stake/changeApproval", async ({ token, provider, address, networkID }: IChangeApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    const addresses = getAddresses(networkID);

    const signer = provider.getSigner();
    const d33dContract = new ethers.Contract(addresses.D33D_ADDRESS, D33DTokenContract, signer);
    const gD33DContract = new ethers.Contract(addresses.GD33D_ADDRESS, gD33DTokenContract, signer);

    let approveTx;
    try {
        const gasPrice = await getGasPrice(provider);

        if (token === "d33d") {
            approveTx = await d33dContract.approve(addresses.STAKING_ADDRESS, ethers.constants.MaxUint256, { gasPrice });
        }

        if (token === "gD33d") {
            approveTx = await gD33DContract.approve(addresses.STAKING_ADDRESS, ethers.constants.MaxUint256, { gasPrice });
        }

        const text = "Approve " + (token === "d33d" ? "Staking" : "Unstaking");
        const pendingTxnType = token === "gD33d" ? "approve_staking" : "approve_unstaking";

        dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));
        await approveTx.wait(1);
        // dispatch(success({ text: messages.tx_successfully_send }));
        dispatch(info({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        await dispatch(info({ text: messages.tx_successfully_send }));
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (approveTx) {
           await dispatch(clearPendingTxn(approveTx.hash));
        }
    }

    await sleep(2);

    const stakeAllowance = await d33dContract.allowance(address, addresses.STAKING_ADDRESS);
    const unstakeAllowance = await gD33DContract.allowance(address, addresses.STAKING_ADDRESS);

    return dispatch(
        fetchAccountSuccess({
            staking: {
                d33d: Number(stakeAllowance),
                gD33d: Number(unstakeAllowance),
            },
        }),
    );
});

export interface IChangeStake {
    action: string;
    value: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
    biconomyProvider?:any;
}

export interface IRedeem {
    action: string;
    address: string;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    biconomyProvider?: any;
    networkID: Networks;
}

export const changeStake = createAsyncThunk("stake/changeStake", async ({ action, value, provider, address, networkID }: IChangeStake, { dispatch, getState }) => {

    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();
  
    const staking = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, signer);

    let stakeTx;

    try {
        const gasPrice = await getGasPrice(provider);
        if (action === "stake") {
            stakeTx = await staking.stake(ethers.utils.parseUnits(value), address, { gasPrice });
        } else if (action === "unstake") {
            stakeTx = await staking.unStake(true, { gasPrice });
        } else {
            // redeeming [TODO]
            // stakeTx = await staking.redeem(ethers.utils.parseUnits(value), true, { gasPrice });
        }
        const pendingTxnType = action === "stake" ? "staking" : (action === "unstake" ? "unstaking" : "redeeming");
        dispatch(fetchPendingTxns({ txnHash: stakeTx.hash, text: getStakingTypeText(action), type: pendingTxnType }));
        await stakeTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (stakeTx) {
            dispatch(clearPendingTxn(stakeTx.hash));
        }
    }
    dispatch(info({ text: messages.your_balance_update_soon }));
    await sleep(10);
    await dispatch(getBalances({ address, networkID, provider }));
    dispatch(info({ text: messages.your_balance_updated }));
    return;
});

export const redeem = createAsyncThunk("stake/redeem", async ({ action, provider, networkID, address }: IRedeem, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();

    const staking = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, signer);

    let stakeTx;

    try {
        const gasPrice = await getGasPrice(provider);
        stakeTx = await staking.claimRewards( { gasPrice });
        dispatch(fetchPendingTxns({ txnHash: stakeTx.hash, text: getStakingTypeText(action), type: "redeeming" }));
        await stakeTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch(err: any) {
        return metamaskErrorWrap(err, dispatch);
    }  finally {
        if (stakeTx) {
            dispatch(clearPendingTxn(stakeTx.hash));
        }
        dispatch(info({ text: messages.your_balance_update_soon }));
        await sleep(10);
        await dispatch(getBalances({ address, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;
    }
})
