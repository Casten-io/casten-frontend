import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { setAll } from "src/helpers";
import { RootState } from "../store";

interface IBiconomyEvent {
    amountAboveThreshold: boolean, 
    happyHour: boolean, 
    happyHourInfo: any,
    message: string
}

export interface IBiconomySlice  { 
    eventInfo: IBiconomyEvent | null;
    happyHour: boolean;
    biconomy: any; 
    signer: any;
}

const initialState = {
    eventInfo: null,
    happyHour: false,
    biconomy: null, 
    signer: null
}

export const saveHappyHourInfo = createAsyncThunk("biconomy/saveHappyHourInfo", async({ eventInfo, happyHour, biconomy, signer } : IBiconomySlice, {dispatch})=> {
    return {
        eventInfo, 
        happyHour,
        biconomy, 
        signer
    };
});

const biconomySlice = createSlice({
    name: "biconomy",
    initialState,
    reducers: {
        fetchBiconomySuccess(state,action) {
            setAll(state, action.payload);
        }
    }, 
    extraReducers: builder => {
        builder 
            .addCase(saveHappyHourInfo.fulfilled, (state, action) => {
                setAll(state, action.payload);
            })
    }
})

export default biconomySlice.reducer;

export const { fetchBiconomySuccess } = biconomySlice.actions;

const baseInfo = (state: RootState) => state.biconomy;

export const getBiconomyState = createSelector(baseInfo, biconomy => biconomy);


