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
    networkInfo: null | NetworkInfo,
    executionId?: string
    assetListExecution?: string
    totalOriginatedLoans?: string
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
    },
})

// Action creators are generated for each case reducer function
export const {
  walletConnect,
  updateExecution,
  updateAssetListExecution,
  updateTotalOriginatedLoans,
} = accountSlice.actions

export default accountSlice.reducer
