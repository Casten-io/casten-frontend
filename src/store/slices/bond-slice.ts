import { ethers, constants } from "ethers";
import { getMarketPrice, getTokenPrice } from "../../helpers";
import { calculateUserBondDetails, getBalances } from "./account-slice";
import { getAddresses } from "../../constants";
import { fetchPendingTxns, clearPendingTxn } from "./pending-txns-slice";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { fetchAccountSuccess } from "./account-slice";
import { Bond } from "../../helpers/bond/bond";
import { Networks } from "../../constants/blockchain";
import { getBondCalculator } from "../../helpers/bond-calculator";
import { RootState } from "../store";
import { mana, sand, eth/*, ethD33D, wavax */ } from "../../helpers/bond";
import { error, warning, success, info } from "../slices/messages-slice";
import { messages } from "../../constants/messages";
import { getGasPrice } from "../../helpers/get-gas-price";
import { metamaskErrorWrap } from "../../helpers/metamask-error-wrap";
import { sleep } from "../../helpers";
import { BigNumber } from "ethers";

interface IChangeApproval {
    bond: Bond;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
    address: string;
}

export const changeApproval = createAsyncThunk("bonding/changeApproval", async ({ bond, provider, networkID, address }: IChangeApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const signer = provider.getSigner();
    const reserveContract = bond.getContractForReserve(networkID, signer);

    let approveTx;
    try {
        const gasPrice = await getGasPrice(provider);
        const bondAddr = bond.getAddressForBond(networkID);
        if (!bond.isNFT) {
            approveTx = await reserveContract.approve(bondAddr, constants.MaxUint256, { gasPrice });
        } else {
            approveTx = await reserveContract.setApprovalForAll(bondAddr, true, { gasPrice });
        }
        dispatch(
            fetchPendingTxns({
                txnHash: approveTx.hash,
                text: "Approving " + bond.displayName,
                type: "approve_" + bond.name,
            }),
        );
        await approveTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        metamaskErrorWrap(err, dispatch);
    } finally {
        if (approveTx) {
            dispatch(clearPendingTxn(approveTx.hash));
        }
    }

    await sleep(2);

    let allowance = "0";

    if (!bond.isNFT) {
        allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    } else {
        let _allowance = await reserveContract.isApprovedForAll(address, bond.getAddressForBond(networkID));
        allowance = _allowance ? "1" : "0";
    }

    return dispatch(
        fetchAccountSuccess({
            bonds: {
                [bond.name]: {
                    allowance: Number(allowance),
                },
            },
        }),
    );
});

interface ICalcBondDetails {
    bond: Bond;
    value: string | null;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IBondDetails {
    bond: string;
    bondDiscount: number;
    bondQuote: number;
    purchased: number;
    vestingTerm: number;
    maxBondPrice: number;
    bondPrice: number;
    marketPrice: number;
    maxBondPriceToken: number;
}

export const calcBondDetails = createAsyncThunk("bonding/calcBondDetails", async ({ bond, value, provider, networkID }: ICalcBondDetails, { dispatch }) => {
    if (!value) {
        value = "0";
    }

    const amountInWei = ethers.utils.parseEther(value);

    let bondPrice = 0,
        bondDiscount = 0,
        valuation = 0,
        bondQuote = 0;

    const addresses = getAddresses(networkID);

    const bondContract = bond.getContractForBond(networkID, provider);
    const bondCalcContract = getBondCalculator(networkID, provider, bond.name);

    const terms = await bondContract.terms();
    const maxBondPrice = (await bondContract.maxPayout()) / Math.pow(10, 18);

    let marketPrice = await getMarketPrice(networkID, provider);

    const usdcPrice = getTokenPrice("USDC");
    marketPrice = (marketPrice / Math.pow(10, -12)) * usdcPrice;

    try {
        bondPrice = await bondContract.bondPriceInUSD();
/*[TODO]        
        if (bond.name === ethD33D.name) {
            const ethPrice = getTokenPrice("ETH");
            bondPrice = bondPrice * ethPrice;
        }
*/
        bondDiscount = (marketPrice - bondPrice / Math.pow(10, bond.reserveDecimals)) / (bondPrice / Math.pow(10, bond.reserveDecimals));
    } catch (e) {
        console.log("error getting bondPriceInUSD", e);
    }

    let maxBondPriceToken = 0;
    const maxBondValue = ethers.utils.parseEther("1");

    if (bond.isLP && (bond.name != mana.name && bond.name != sand.name && bond.name != eth.name)) {
        valuation = await bondCalcContract.valuation(bond.getAddressForReserve(networkID), amountInWei);
        bondQuote = await bondContract.payoutFor(valuation);
        bondQuote = bondQuote / Math.pow(10, 18);

        const maxValuation = await bondCalcContract.valuation(bond.getAddressForReserve(networkID), maxBondValue);
        const maxBondQuote = await bondContract.payoutFor(maxValuation);
        maxBondPriceToken = maxBondPrice / (maxBondQuote * Math.pow(10, -18));
    } else {
        bondQuote = await bondContract.payoutFor(amountInWei);
        bondQuote = bondQuote / Math.pow(10, 18);

        const maxBondQuote = await bondContract.payoutFor(maxBondValue);
        maxBondPriceToken = maxBondPrice / (maxBondQuote * Math.pow(10, -18));
    }

    if (!!value && bondQuote > maxBondPrice) {
        dispatch(error({ text: messages.try_mint_more(maxBondPrice.toFixed(2).toString()) }));
    }

    // Calculate bonds purchased
    const token = bond.getContractForReserve(networkID, provider);
    let purchased = await token.balanceOf(addresses.TREASURY_ADDRESS);

    if (bond.isLP && (bond.name != mana.name && bond.name != sand.name)) {
        const assetAddress = bond.getAddressForReserve(networkID);
        const markdown = await bondCalcContract.markdown(assetAddress);

        purchased = await bondCalcContract.valuation(assetAddress, purchased);
        purchased = (purchased / Math.pow(10, bond.reserveDecimals));
/*[TODO]
        if (bond.name === ethD33D.name) {
            const ethPrice = getTokenPrice("ETH");
            purchased = purchased * ethPrice;
        }
*/
    } else if (bond.isNFT) {
        const nftPrice = await bondContract.getPrice();
        purchased = purchased * nftPrice[1] / Math.pow(10, 18);
    } else {
        if (bond.tokensInStrategy) {
            purchased = BigNumber.from(purchased).add(BigNumber.from(bond.tokensInStrategy)).toString();
        }
        purchased = purchased / Math.pow(10, bond.reserveDecimals);
/*[TODO]
        if (bond.name === wavax.name) {
            const avaxPrice = getTokenPrice("AVAX");
            purchased = purchased * avaxPrice;
        }
*/
    }

    return {
        bond: bond.name,
        bondDiscount,
        bondQuote,
        purchased,
        vestingTerm: Number(terms.vestingTerm),
        maxBondPrice,
        bondPrice: bondPrice / Math.pow(10, bond.reserveDecimals),
        marketPrice,
        maxBondPriceToken,
    };
});

export interface IBondAsset {
    value: string;
    address: string;
    bond: Bond;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    biconomyProvider?:any;
    slippage: number;
    useEth: boolean;
}
export const bondAsset = createAsyncThunk("bonding/bondAsset", async ({ value, address, bond, networkID, provider, slippage, useEth }: IBondAsset, { dispatch }) => {
    const depositorAddress = address;
    const acceptedSlippage = slippage / 100 || 0.005;
    const signer = provider.getSigner();
    const bondContract = bond.getContractForBond(networkID, signer);

    const calculatePremium = await bondContract.bondPrice();
    const maxPremium = Math.round(calculatePremium * (1 + acceptedSlippage));

    let bondTx;
    try {
        const gasPrice = await getGasPrice(provider);
        if (!bond.isNFT) {
            const _value = Number(value) * 10000; // for decimal values, like 0.05 eth
            const valueInWei = BigNumber.from(_value).mul(BigNumber.from(10).pow(BigNumber.from(bond.reserveDecimals))).div(BigNumber.from(10000));

            if (useEth) {
                bondTx = await bondContract.deposit(valueInWei.toString(), maxPremium.toString(), depositorAddress, { value: valueInWei.toString(), gasPrice });
            } else {
                bondTx = await bondContract.deposit(valueInWei.toString(), maxPremium.toString(), depositorAddress, { gasPrice });
            }
        } else {
            // value is token id
            bondTx = await bondContract.deposit(value, maxPremium.toString(), depositorAddress, { gasPrice });
        }
        dispatch(
            fetchPendingTxns({
                txnHash: bondTx.hash,
                text: "Bonding " + bond.displayName,
                type: "bond_" + bond.name,
            }),
        );
        await bondTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
        dispatch(info({ text: messages.your_balance_update_soon }));
        await sleep(10);
        await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (bondTx) {
            dispatch(clearPendingTxn(bondTx.hash));
        }
    }
});

export interface IRedeemBond {
    address: string;
    bond: Bond;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    biconomyProvider?:any;
    autostake: boolean;
}

export const redeemBond = createAsyncThunk("bonding/redeemBond", async ({ address, bond, networkID, provider, autostake }: IRedeemBond, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const signer = provider.getSigner();
    const bondContract = bond.getContractForBond(networkID, signer);

    let redeemTx;
    try {
        const gasPrice = await getGasPrice(provider);

        redeemTx = await bondContract.redeem(address, autostake === true, { gasPrice });
        const pendingTxnType = "redeem_bond_" + bond.name + (autostake === true ? "_autostake" : "");
        dispatch(
            fetchPendingTxns({
                txnHash: redeemTx.hash,
                text: "Redeeming " + bond.displayName,
                type: pendingTxnType,
            }),
        );
        await redeemTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
        await sleep(0.01);
        dispatch(info({ text: messages.your_balance_update_soon }));
        await sleep(10);
        await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
        await dispatch(getBalances({ address, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;
    } catch (err: any) {
        metamaskErrorWrap(err, dispatch);
    } finally {
        if (redeemTx) {
            dispatch(clearPendingTxn(redeemTx.hash));
        }
    }
});

export interface IBondSlice {
    loading: boolean;
    [key: string]: any;
}

const initialState: IBondSlice = {
    loading: true,
};

const setBondState = (state: IBondSlice, payload: any) => {
    const bond = payload.bond;
    const newState = { ...state[bond], ...payload };
    state[bond] = newState;
    state.loading = false;
};

const bondingSlice = createSlice({
    name: "bonding",
    initialState,
    reducers: {
        fetchBondSuccess(state, action) {
            state[action.payload.bond] = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(calcBondDetails.pending, state => {
                state.loading = true;
            })
            .addCase(calcBondDetails.fulfilled, (state, action) => {
                setBondState(state, action.payload);
                state.loading = false;
            })
            .addCase(calcBondDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default bondingSlice.reducer;

export const { fetchBondSuccess } = bondingSlice.actions;

const baseInfo = (state: RootState) => state.bonding;

export const getBondingState = createSelector(baseInfo, bonding => bonding);
