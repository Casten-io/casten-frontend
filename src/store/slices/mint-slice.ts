import { ethers, BigNumber } from "ethers";
import { getAddresses } from "../../constants";
import { D33DTokenContract, RedeemContract, USMContract, USMMintContract, DVDContract } from "../../abi";
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "./pending-txns-slice";
import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import { fetchAccountSuccess, getBalances } from "./account-slice";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Networks } from "../../constants/blockchain";
import { setAll } from "../../helpers";
import { RootState } from "../store";
import { warning, success, info, error } from "../../store/slices/messages-slice";
import { messages } from "../../constants/messages";
import { getGasPrice } from "../../helpers/get-gas-price";
import { metamaskErrorWrap } from "../../helpers/metamask-error-wrap";
import { sleep } from "../../helpers";

interface IGetMintBalances {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IMintBalances {
    balances: {
        dvd: string;
        d33d: string;
        usm: string;
    };
    allowances: {
        d33d: string;
        dvd: string;
    };
    maxAmounts: {
        d33d: string;
        dvd: string;
    };
}

export const getMintBalances = createAsyncThunk("mint/getBalances", async ({ address, networkID, provider }: IGetMintBalances): Promise<IMintBalances> => {
    const addresses = getAddresses(networkID);

    const d33dContract = new ethers.Contract(addresses.D33D_ADDRESS, D33DTokenContract, provider);
    const d33dBalance = await d33dContract.balanceOf(address);

    const usmContract = new ethers.Contract(addresses.USM_ADDREESS, USMContract, provider);
    const usmBalance = await usmContract.balanceOf(address);

    const dvdContract = new ethers.Contract(addresses.DVD_ADDRESS, DVDContract, provider);
    const dvdBalance = await dvdContract.balanceOf(address);

    const allowanceD33d = await d33dContract.allowance(address, addresses.USM_MINTER);
    const allowanceDvd = await dvdContract.allowance(address, addresses.USM_MINTER);

    const usmMinterContract = new ethers.Contract(addresses.USM_MINTER, USMMintContract, provider);

    const dvdAmountOut = dvdBalance.toString().length < 7 ? BigNumber.from(0) : await usmMinterContract.getUsmAmountOut(addresses.DVD_ADDRESS, dvdBalance.toString());

    const d33dAmountOut = d33dBalance.toString().length < 7 ? BigNumber.from(0) : await usmMinterContract.getUsmAmountOut(addresses.D33D_ADDRESS, d33dBalance.toString());

    return {
        balances: {
            dvd: ethers.utils.formatUnits(dvdBalance, 18),
            d33d: ethers.utils.formatUnits(d33dBalance, 18),
            usm: ethers.utils.formatUnits(usmBalance, 18),
        },
        allowances: {
            d33d: ethers.utils.formatUnits(allowanceD33d, 18),
            dvd: ethers.utils.formatUnits(allowanceDvd, 18),
        },
        maxAmounts: {
            d33d: d33dAmountOut.isZero()? "0" : ethers.utils.formatUnits(d33dAmountOut, 18),
            dvd: dvdAmountOut.isZero() ? "0" : ethers.utils.formatUnits(dvdAmountOut, 18),
        },
    };
});

export interface IMintToken {
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    biconomyProvider?: any;
    address: string;
    networkID: Networks;
    amount: string;
    token: number;
}

// set signature = 0 if signature string is not passed into the function
export const mintToken = createAsyncThunk("mint/mintToken", async ({ provider, address, networkID, amount, token }: IMintToken, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();
    const mintContract = new ethers.Contract(addresses.USM_MINTER, USMMintContract, signer);
    const newAmount = ethers.utils.parseUnits(amount, 18);

    let mintTx;

    const gasPrice = await getGasPrice(provider);

    if (token === 1) {
        try {
            mintTx = await mintContract.mintWithD33d(newAmount, address, { gasPrice });

            dispatch(
                fetchPendingTxns({
                    txnHash: mintTx.hash,
                    text: "Minting",
                    type: "D33D to USM",
                }),
            );
            await mintTx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (mintTx) {
                dispatch(clearPendingTxn(mintTx.hash));
            }
        }
    } else if (token === 2) {
        try {
            console.log("In here boi 5");

            mintTx = await mintContract.mintWithDvd(newAmount, address, { gasPrice });

            dispatch(
                fetchPendingTxns({
                    txnHash: mintTx.hash,
                    text: "Mint",
                    type: "DVD to USM",
                }),
            );
            await mintTx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (mintTx) {
                dispatch(clearPendingTxn(mintTx.hash));
            }
        }
    }

    await sleep(2);

    dispatch(getMintBalances({ address, networkID, provider }));
});

interface IMintApprove {
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
    token: number;
}

export const tokenApprove = createAsyncThunk("mint/tokenApprove", async ({ provider, address, networkID, token }: IMintApprove, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();
    const d33dContract = new ethers.Contract(addresses.D33D_ADDRESS, D33DTokenContract, signer);
    const dvdContract = new ethers.Contract(addresses.DVD_ADDRESS, DVDContract, signer);

    const amount = "999999999000000000000000000";
    const newAmount = ethers.BigNumber.from(amount);

    let approveTxD33d;
    let approveTxDvd;

    if (token === 1) {
        try {
            approveTxD33d = await d33dContract.approve(addresses.USM_MINTER, newAmount);
            dispatch(success({ text: messages.tx_successfully_send }));
            dispatch(
                fetchPendingTxns({
                    txnHash: approveTxD33d.hash,
                    text: "Approve",
                    type: "D33D",
                }),
            );
            // approveTxPD33D.wait();
            // dispatch transaction is succesful,
            await approveTxD33d.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            console.log(err);
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (approveTxD33d) {
                // dispatch(clearPendingTxn(approveTxPD33D.hash));
                dispatch(clearPendingTxn(approveTxD33d.hash));
            }
        }

        // return the things that you want to store at the state here
    } else if (token === 2) {
        try {
            approveTxDvd = await dvdContract.approve(addresses.USM_MINTER, newAmount);
            dispatch(success({ text: messages.tx_successfully_send }));
            dispatch(
                fetchPendingTxns({
                    txnHash: approveTxDvd.hash,
                    text: "Approve",
                    type: "DVD",
                }),
            );

            await approveTxDvd.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            console.log(err);
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (approveTxDvd) {
                // dispatch(clearPendingTxn(approveTxPD33D.hash));
                dispatch(clearPendingTxn(approveTxDvd.hash));
            }
        }
    }

    await sleep(2);

    dispatch(getMintBalances({ address, networkID, provider }));
});

export interface IMintSlice {
    balances: {
        dvd: string;
        d33d: string;
        usm: string;
    };
    allowances: {
        d33d: string;
        dvd: string;
    };
    maxAmounts: {
        d33d: string;
        dvd: string;
    };
}

const initialState: IMintSlice = {
    balances: { d33d: "", dvd: "", usm: "" },
    allowances: { d33d: "", dvd: "" },
    maxAmounts: { d33d: "", dvd: "" },
};

const mintSlice = createSlice({
    name: "mint",
    initialState,
    reducers: {
        fetchMintSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(getMintBalances.fulfilled, (state, action) => {
                setAll(state, action.payload);
            })
            .addCase(getMintBalances.rejected, (state, { error }) => {
                console.log(error);
            });
    },
});

export default mintSlice.reducer;

export const { fetchMintSuccess } = mintSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getMintState = createSelector(baseInfo, mint => mint);
