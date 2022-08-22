import { createSlice } from '@reduxjs/toolkit';
import {  ethers } from "ethers";
import type { PayloadAction } from '@reduxjs/toolkit'
import {Web3Provider} from "@ethersproject/providers/src.ts/web3-provider";

export interface AccountState {
    address: string,
    provider: null | ethers.providers.Web3Provider
}

const initialState: AccountState = {
    address: "",
    provider: null
}

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        walletConnect: (state, action) => {
            state.address = action.payload.address;
            state.provider = action.payload.provider
        }
    },
})

// Action creators are generated for each case reducer function
export const { walletConnect } = accountSlice.actions

export default accountSlice.reducer