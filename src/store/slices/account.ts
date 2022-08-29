import { createSlice } from '@reduxjs/toolkit';
import {  ethers } from "ethers";
import type { PayloadAction } from '@reduxjs/toolkit'
import {Web3Provider} from "@ethersproject/providers/src.ts/web3-provider";

interface NetworkInfo {
    chainId: number;
    name: string;
}

export interface AccountState {
    address: string,
    provider: null | ethers.providers.Web3Provider,
    networkInfo: null | NetworkInfo
}

const initialState: AccountState = {
    address: "",
    provider: null,
    networkInfo: null
}

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        walletConnect: (state, action) => {
            state.address = action.payload.address;
            state.provider = action.payload.provider;
            state.networkInfo = action.payload.networkInfo;
        }
    },
})

// Action creators are generated for each case reducer function
export const { walletConnect } = accountSlice.actions

export default accountSlice.reducer