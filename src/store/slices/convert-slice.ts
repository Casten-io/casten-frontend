import { ethers } from "ethers";
import { getAddresses } from "../../constants";
import { ERC20Contract, RedeemContract, Pd33dContract } from "../../abi";
import { clearPendingTxn, fetchPendingTxns } from "./pending-txns-slice";
import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Networks } from "../../constants/blockchain";
import { setAll } from "../../helpers";
import { RootState } from "../store";
import { warning, success } from "../../store/slices/messages-slice";
import { messages } from "../../constants/messages";
import { getGasPrice } from "../../helpers/get-gas-price";
import { metamaskErrorWrap } from "../../helpers/metamask-error-wrap";
import { sleep } from "../../helpers";

interface IGetPd33dBalances {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IPd33dBalances {
    balances: {
        pd33d: string;
        usdc: string;
    };
    isWhitelisted: boolean;
    redeemable: string;
    allowances: {
        usdc: string;
    };
}

export const getPd33dBalances = createAsyncThunk("convert/getPd33dBalances", async ({ address, networkID, provider }: IGetPd33dBalances): Promise<IPd33dBalances> => {
    const addresses = getAddresses(networkID);

    const usdcContract = new ethers.Contract(addresses.USDC_ADDRESS, ERC20Contract, provider);
    const usdcBalance = await usdcContract.balanceOf(address);

    const pd33dContract = new ethers.Contract(addresses.PD33D_ADDRESS, Pd33dContract, provider);
    const pd33dBalance = await pd33dContract.balanceOf(address);

    const redeemContract = new ethers.Contract(addresses.REDEEM_ADDRESS, RedeemContract, provider);
    const isAddressWhitelisted = await redeemContract.isContractWhitelisted(address);
    const redeemableFor = await redeemContract.redeemableFor(address);
    const redeemableAmount = await redeemContract.terms(address);

    const usdcAllowance = await usdcContract.allowance(address, addresses.REDEEM_ADDRESS);

    return {
        balances: {
            pd33d: ethers.utils.formatUnits(pd33dBalance, 18),
            usdc: ethers.utils.formatUnits(usdcBalance, 6),
        },
        isWhitelisted: isAddressWhitelisted,
        redeemable: String(Math.min(Number(ethers.utils.formatUnits(redeemableAmount.max, 18)), Number(ethers.utils.formatUnits(redeemableFor, 18)))),
        allowances: {
            usdc: ethers.utils.formatUnits(usdcAllowance, 6),
        },
    };
});

export interface IRedeemToken {
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    biconomyProvider?: any;
    address: string;
    networkID: Networks;
    amount: string;
    signature: string;
    stake: number;
}

// set signature = 0 if signature string is not passed into the function
export const redeemToken = createAsyncThunk("convert/redeemToken", async ({ provider, address, networkID, amount, signature, stake }: IRedeemToken, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    console.log("Here", amount);

    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();
    const redeemContract = new ethers.Contract(addresses.REDEEM_ADDRESS, RedeemContract, signer);
    const newAmount = ethers.utils.parseUnits(amount, 18);

    let redeemTx;
    try {
        const gasPrice = await getGasPrice(provider);
        if (!signature) {
            console.log(signature, "this");
            redeemTx = await redeemContract.redeem(newAmount, [], stake, { gasPrice });
        } else {
            redeemTx = await redeemContract.redeem(newAmount, signature, stake, { gasPrice });
        }

        dispatch(
            fetchPendingTxns({
                txnHash: redeemTx.hash,
                text: "Converting",
                type: "pD33D to D33D",
            }),
        );
        await redeemTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (redeemTx) {
            dispatch(clearPendingTxn(redeemTx.hash));
        }
    }

    await sleep(2);

    dispatch(getPd33dBalances({ address, networkID, provider }));
});

interface IRedeemApprove {
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
}

export const redeemApprove = createAsyncThunk("convert/redeemApprove", async ({ provider, address, networkID }: IRedeemApprove, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();
    // const pd33dContract = new ethers.Contract(addresses.PD33D_ADDRESS, Pd33dContract, signer);
    const usdcContract = new ethers.Contract(addresses.USDC_ADDRESS, ERC20Contract, signer);
    const amount = "999999999000000000000000000";
    const newAmount = ethers.BigNumber.from(amount);

    let approveTxUSDC;

    try {
        approveTxUSDC = await usdcContract.approve(addresses.REDEEM_ADDRESS, newAmount);
        dispatch(success({ text: messages.tx_successfully_send }));
        dispatch(
            fetchPendingTxns({
                txnHash: approveTxUSDC.hash,
                text: "Approving Pre-Conversion",
                type: "USDC to D33D",
            }),
        );
        // approveTxPD33D.wait();
        // dispatch transaction is succesful,
        await approveTxUSDC.wait();
        dispatch(success({ text: messages.tx_successfully_send }));

        // return the things that you want to store at the state here
        dispatch(getPd33dBalances({ address, networkID, provider }));
    } catch (err: any) {
        console.log(err);
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (approveTxUSDC) {
            // dispatch(clearPendingTxn(approveTxPD33D.hash));
            dispatch(clearPendingTxn(approveTxUSDC.hash));
        }
    }

    await sleep(2);
});

export interface IConvertSlice {
    balances: {
        pd33d: string;
        usdc: string;
    };
    isWhitelisted: boolean;
    redeemable: string;
    allowances: {
        // pd33d: string;
        usdc: string;
    };
}

const initialState: IConvertSlice = {
    balances: { usdc: "", pd33d: "" },
    isWhitelisted: false,
    redeemable: "",
    allowances: { usdc: "" },
};

const convertSlice = createSlice({
    name: "convert",
    initialState,
    reducers: {
        fetchConvertSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(getPd33dBalances.fulfilled, (state, action) => {
                setAll(state, action.payload);
            })
            .addCase(getPd33dBalances.rejected, (state, { error }) => {
                console.log(error);
            });
    },
});

export default convertSlice.reducer;

export const { fetchConvertSuccess } = convertSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getConvertState = createSelector(baseInfo, convert => convert);
