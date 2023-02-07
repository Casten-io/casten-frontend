import { createSlice } from '@reduxjs/toolkit';
import {  ethers } from "ethers";

interface NetworkInfo {
    chainId: number;
    name: string;
}

export interface AccountState {
    address: string;
    provider: null | ethers.providers.Web3Provider;
    networkInfo: null | NetworkInfo;
    isWalletConnected: boolean;
    executionId?: string;
    assetListExecution?: string;
    totalOriginatedLoans?: string;
    securitizeAT?: string;
    securitizeRT?: string;
    securitizeId?: string;
}

const initialState: AccountState = {
    address: "",
    provider: null,
    networkInfo: null,
    isWalletConnected: Boolean(Number(localStorage?.getItem('isWalletConnected'))),
    securitizeAT: localStorage?.getItem('sAT') || undefined,
    securitizeRT: localStorage?.getItem('sRT') || undefined,
    securitizeId: localStorage?.getItem('sID') || undefined
}

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        walletConnect: (state, action) => {
            state.address = action.payload.address;
            state.provider = action.payload.provider;
            state.networkInfo = action.payload.networkInfo;
            state.isWalletConnected = true;
            localStorage?.setItem('isWalletConnected', '1');
        },
        updateExecution: (state, action) => {
            state.executionId = action.payload.executionId;
        },
        updateAssetListExecution: (state, action) => {
            state.assetListExecution = action.payload.assetListExecution;
        },
        updateTotalOriginatedLoans: (state, action) => {
            state.totalOriginatedLoans = action.payload.totalOriginatedLoans;
        },
        updateSercuritizeDetails: (state, action) => {
            state.securitizeAT = action.payload.at || state.securitizeAT;
            state.securitizeRT = action.payload.rt || state.securitizeRT;
            state.securitizeId = action.payload.investorId || state.securitizeId;
            localStorage?.setItem('sAT', action.payload.at || state.securitizeAT);
            localStorage?.setItem('sRT', action.payload.rt || state.securitizeRT);
            localStorage?.setItem('sID', action.payload.investorId || state.securitizeId);
        },
        disconnect: (state) => {
            state.address = '';
            state.provider = null;
            state.networkInfo = null;
            state.isWalletConnected = false;
            state.securitizeAT = undefined;
            state.securitizeRT = undefined;
            state.securitizeId = undefined;
            localStorage?.removeItem('sAT');
            localStorage?.removeItem('sRT');
            localStorage?.removeItem('sID');
            localStorage?.removeItem('isWalletConnected');
        },
    },
})

// Action creators are generated for each case reducer function
export const {
    walletConnect,
    updateExecution,
    updateAssetListExecution,
    updateTotalOriginatedLoans,
    updateSercuritizeDetails,
    disconnect,
} = accountSlice.actions

export default accountSlice.reducer
