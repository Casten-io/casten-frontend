import { ethers, BigNumber } from "ethers";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { CurrencyAmount, Percent, Token } from '@sushiswap/core-sdk'
import { setAll } from "src/helpers";
import { Networks } from "src/constants/blockchain";
import { getAddresses } from "src/constants";
import { messages } from "src/constants/messages";
import { BentoBoxContract, D33DTokenContract, KashiPairContract, USMContract } from "src/abi";
import { RootState } from "src/store/store";
import { getMintBalances } from "./mint-slice"
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "./pending-txns-slice";
import { warning, success, info, error } from "../../store/slices/messages-slice";
import { metamaskErrorWrap } from "src/helpers/metamask-error-wrap";
import { KashiMediumRiskLendingPair } from "src/helpers/sushi/kashi/KashiLendingPair"
import { pollKashiPair } from "src/helpers/sushi/kashi/pollKashiPair";
import { tryParseAmount } from "src/helpers/sushi/lib/parse"
import { unwrappedToken } from "src/helpers/sushi/lib/wrappedCurrency"
import { getPermit } from "src/helpers/sushi/lib/bentoPermit";
import { lendAssetExecute, withdrawAssetExecute, borrowAssetExecute, repayAssetExecute } from "src/helpers/sushi/executes"

interface IGetBalances {
    account: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

export interface IUsmLendingSlice {
    loading?: boolean;
    rejected: boolean;
    total: {
        collateralAmount: CurrencyAmount<Token> | undefined;
        borrowedAmount: CurrencyAmount<Token> | undefined;
        lentAmount: CurrencyAmount<Token> | undefined;
        marketHealth: Percent | undefined;
    },
    account: {
        kashiPair: KashiMediumRiskLendingPair | undefined;
        approvedKashiInBentoBox: boolean;
        assetAmount: CurrencyAmount<Token> | undefined;
        collateralAmount: CurrencyAmount<Token> | undefined;
        borrowedAmount: CurrencyAmount<Token> | undefined;
        health: string;
    };
}

export interface IUsmAccountStatus {
    total: {
        collateralAmount: CurrencyAmount<Token> | undefined;
        borrowedAmount: CurrencyAmount<Token> | undefined;
        lentAmount: CurrencyAmount<Token> | undefined;
        marketHealth: Percent | undefined;
    },
    account: {
        kashiPair: KashiMediumRiskLendingPair | undefined;
        approvedKashiInBentoBox: boolean;
        assetAmount: CurrencyAmount<Token> | undefined;
        collateralAmount: CurrencyAmount<Token> | undefined;
        borrowedAmount: CurrencyAmount<Token> | undefined;
        health: string;
    };
}

export const getUsmAccountStatus = createAsyncThunk("usmLending/getUsmAccountStatus", async ({account, networkID, provider}: IGetBalances): Promise<IUsmAccountStatus> => {
    const addresses = getAddresses(networkID);
    const bentoBoxContract = new ethers.Contract(addresses.BENTOBOX_ADDRESS, BentoBoxContract, provider);
    const kashiPairContract = new ethers.Contract(addresses.KASHI_PAIR_ADDRESS, KashiPairContract, provider);
    const usmContract = new ethers.Contract(addresses.USM_ADDREESS, USMContract, provider.getSigner())

    const balanceOfUsm = await usmContract.balanceOf(addresses.BENTOBOX_ADDRESS)
    console.log("USM in BentoBox: ", ethers.utils.formatUnits(balanceOfUsm, 18))

    // const totalBorrow = await kashiPairContract.totalBorrow();
    // console.log('total borrow: ', totalBorrow);

    console.log("before polling kashi pair: ", account);
    const kashiPair: KashiMediumRiskLendingPair = await pollKashiPair(kashiPairContract, bentoBoxContract, account, provider, networkID)
    const approvedKashiInBentoBox = await bentoBoxContract.masterContractApproved(addresses.KASHI_PAIR_ADDRESS, account)
    console.log("approved kashi in bentoBox: ", approvedKashiInBentoBox)

    const collateralShare = kashiPair.userCollateralShare
    const borrowedPart = kashiPair.userBorrowPart
    const userAssetAmount = CurrencyAmount.fromRawAmount(kashiPair.collateral.token, kashiPair.currentUserAssetAmount)
    const userCollateralAmount = CurrencyAmount.fromRawAmount(kashiPair.collateral.token, kashiPair.userCollateralAmount)
    const userBorrowedAmount = CurrencyAmount.fromRawAmount(kashiPair.asset.token, kashiPair.currentUserBorrowAmount)

    const totalCollateralAmount = CurrencyAmount.fromRawAmount(kashiPair.collateral.token, kashiPair.totalCollateralAmount)
    const totalBorrowedAmount = CurrencyAmount.fromRawAmount(kashiPair.asset.token, kashiPair.currentBorrowAmount)
    const totalLentAmount = CurrencyAmount.fromRawAmount(kashiPair.asset.token, kashiPair.currentAllAssets)
    const marketHealth = new Percent(kashiPair.marketHealth, 1e18)

    console.log('Total collateral: ', totalCollateralAmount.toFixed(2))
    console.log('Total borrow: ', totalBorrowedAmount.toFixed(2))

    return {
        total: {
            collateralAmount: totalCollateralAmount,
            borrowedAmount: totalBorrowedAmount,
            lentAmount: totalLentAmount,
            marketHealth
        },
        account: {
            kashiPair,
            approvedKashiInBentoBox,
            assetAmount: userAssetAmount,
            collateralAmount: userCollateralAmount,
            borrowedAmount: userBorrowedAmount,
            health: ethers.utils.formatUnits(kashiPair.health.toString(), 16)
        }
    }
})

interface IDepositAsset {
    pair: KashiMediumRiskLendingPair;
    account: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    amount: string;
    approved: boolean;
}

export const depositAndLendAsset = createAsyncThunk("usmLending/depositAndLendAsset", async ({
    pair, 
    account, 
    networkID, 
    provider, 
    amount,
    approved
}: IDepositAsset, { dispatch, rejectWithValue }) => {
    const addresses = getAddresses(networkID);
    const bentoBoxContract = new ethers.Contract(addresses.BENTOBOX_ADDRESS, BentoBoxContract, provider);
    const usmContract = new ethers.Contract(addresses.USM_ADDREESS, USMContract, provider.getSigner())

    const assetToken = unwrappedToken(pair.asset.token)
    const depositAmountCurrencyAmount = tryParseAmount(amount, assetToken)

    const allowance = await usmContract.allowance(account, addresses.BENTOBOX_ADDRESS)
    const parsedAmount = ethers.utils.parseUnits(amount, 18)
    let approveTx
    if (parsedAmount.gt(allowance)) {
        try {
            console.log("approve usm to bentoBox: ", allowance.toString(), parsedAmount.toString())
            approveTx = await usmContract.approve(addresses.BENTOBOX_ADDRESS, ethers.constants.MaxUint256)
            dispatch(
                fetchPendingTxns({
                    txnHash: approveTx.hash,
                    text: "Approving",
                    type: "USM to BentoBox",
                }),
            )
            await approveTx.wait()
        } catch(err: any) {
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (approveTx) {
                dispatch(clearPendingTxn(approveTx.hash));
            }
        }
    }

    // approve kashi to use balance in bentoBox
    let permit
    if (!approved) {
        permit = await getPermit({
            masterContract: getAddresses(networkID).KASHI_PAIR_ADDRESS,
            account,
            library: provider,
            chainId: networkID
        })
        console.log("permit.signature: ", permit.signature)
    }

    if (depositAmountCurrencyAmount) {
        let lendTx
        try {
            lendTx = await lendAssetExecute({
                pair,
                depositAmount: depositAmountCurrencyAmount,
                permit: permit?.signature,
                bentoBoxContract: bentoBoxContract,
                provider,
                chainId: networkID,
                account
            })

            if (lendTx) {
                dispatch(
                    fetchPendingTxns({
                        txnHash: lendTx.hash,
                        text: "Lending",
                        type: "Lending USM",
                    }),
                )
                await lendTx?.wait()

                dispatch(
                    getMintBalances({
                        address: account,
                        networkID: networkID,
                        provider
                    })
                )

                dispatch(
                    getUsmAccountStatus({
                        account,
                        networkID,
                        provider
                    })
                )

                dispatch(success({ text: messages.tx_successfully_send }));
            } else {
                throw "Rejected transaction";
            }
        } catch(err: any) {
            metamaskErrorWrap(err, dispatch);
            return rejectWithValue(false)
        } finally {
            if (lendTx) {
                dispatch(clearPendingTxn(lendTx.hash));
            }
        }
    }
})

interface IWithdrawAsset {
    pair: KashiMediumRiskLendingPair;
    account: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    amount: string;
    approved: boolean;
    removeMax: boolean;
}

export const withdrawAsset = createAsyncThunk("usmLending/withdrawAsset", async ({
    pair, 
    account, 
    networkID, 
    provider, 
    approved,
    amount,
    removeMax
}: IWithdrawAsset, { dispatch, rejectWithValue }) => {
    const assetToken = unwrappedToken(pair.asset.token)
    const withdrawAmountCurrencyAmount = tryParseAmount(amount, assetToken)

    // approve kashi to use balance in bentoBox
    let permit
    if (!approved) {
        permit = await getPermit({
            masterContract: getAddresses(networkID).KASHI_PAIR_ADDRESS,
            account,
            library: provider,
            chainId: networkID
        })
        console.log("permit.signature: ", permit.signature)
    }

    if (withdrawAmountCurrencyAmount) {
        let withdrawTx
        try {
            withdrawTx = await withdrawAssetExecute({
                pair,
                withdrawAmount: withdrawAmountCurrencyAmount,
                permit: permit?.signature,
                provider,
                chainId: networkID,
                account,
                removeMax
            })

            if (withdrawTx) {
                dispatch(
                    fetchPendingTxns({
                        txnHash: withdrawTx.hash,
                        text: "Withdrawing",
                        type: "Withdrawing USM",
                    }),
                )
                await withdrawTx?.wait()

                dispatch(
                    getMintBalances({
                        address: account,
                        networkID: networkID,
                        provider
                    })
                )

                dispatch(
                    getUsmAccountStatus({
                        account,
                        networkID,
                        provider
                    })
                )

                dispatch(success({ text: messages.tx_successfully_send }));
            } else {
                throw "Rejected transaction";
            }
        } catch(err: any) {
            metamaskErrorWrap(err, dispatch);
            return rejectWithValue(false)
        } finally {
            if (withdrawTx) {
                dispatch(clearPendingTxn(withdrawTx.hash));
            }
        }
    }
});

interface IAddCollateralAndBorrowAsset{
    pair: KashiMediumRiskLendingPair;
    account: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    collateralAmount: string;
    borrowAmount: string;
    approved: boolean;
}

export const borrowAsset = createAsyncThunk("usmLending/borrowAsset", async ({
    pair, 
    account, 
    networkID, 
    provider, 
    collateralAmount,
    borrowAmount,
    approved
}: IAddCollateralAndBorrowAsset, { dispatch, rejectWithValue }) => {
    const addresses = getAddresses(networkID);
    const bentoBoxContract = new ethers.Contract(addresses.BENTOBOX_ADDRESS, BentoBoxContract, provider);
    const usmContract = new ethers.Contract(addresses.USM_ADDREESS, USMContract, provider.getSigner())
    const d33dContract = new ethers.Contract(addresses.D33D_ADDRESS, D33DTokenContract, provider.getSigner())

    const assetToken = unwrappedToken(pair.asset.token)
    const collateralToken = unwrappedToken(pair.collateral.token)
    const collateralAmountCurrencyAmount = tryParseAmount(collateralAmount, collateralToken)
    const borrowAmountCurrencyAmount = tryParseAmount(borrowAmount, assetToken)

    const d33dAllowance = await d33dContract.allowance(account, addresses.BENTOBOX_ADDRESS)
    const parsedCollateralAmount = ethers.utils.parseUnits(collateralAmount, 18)
    let approveTx
    if (parsedCollateralAmount.gt(d33dAllowance)) {
        try {
            console.log("approve d33d to bentoBox: ", d33dAllowance.toString(), parsedCollateralAmount.toString())
            approveTx = await d33dContract.approve(addresses.BENTOBOX_ADDRESS, ethers.constants.MaxUint256)
            dispatch(
                fetchPendingTxns({
                    txnHash: approveTx.hash,
                    text: "Approving",
                    type: "D33D to BentoBox",
                }),
            )
            await approveTx.wait()
        } catch(err: any) {
            console.log("error in approving d33d ...")
            metamaskErrorWrap(err, dispatch);
            return rejectWithValue(false)
        } finally {
            if (approveTx) {
                dispatch(clearPendingTxn(approveTx.hash));
            }
        }
    }

    // approve kashi to use balance in bentoBox
    let permit
    if (!approved) {
        permit = await getPermit({
            masterContract: getAddresses(networkID).KASHI_PAIR_ADDRESS,
            account,
            library: provider,
            chainId: networkID
        })
        console.log("permit.signature: ", permit.signature)
    }

    if (collateralAmountCurrencyAmount && borrowAmountCurrencyAmount) {
        let borrowTx
        try {
            borrowTx = await borrowAssetExecute({
                pair,
                collateralAmount: collateralAmountCurrencyAmount,
                borrowAmount: borrowAmountCurrencyAmount,
                permit: permit?.signature,
                provider,
                chainId: networkID,
                account
            })

            if (borrowTx) {
                dispatch(
                    fetchPendingTxns({
                        txnHash: borrowTx.hash,
                        text: "Borrowing",
                        type: "Borrowing USM",
                    }),
                )
                await borrowTx?.wait()

                dispatch(
                    getMintBalances({
                        address: account,
                        networkID: networkID,
                        provider
                    })
                )

                dispatch(
                    getUsmAccountStatus({
                        account,
                        networkID,
                        provider
                    })
                )

                dispatch(success({ text: messages.tx_successfully_send }));
            } else {
                throw "Rejected transaction";
            }
        } catch(err: any) {
            console.log("error in borrowAssetExecute ...")
            metamaskErrorWrap(err, dispatch);
            return rejectWithValue(false);
        } finally {
            if (borrowTx) {
                dispatch(clearPendingTxn(borrowTx.hash));
            }
        }
    }
});

interface IRepayAssetAndRemoveCollateral{
    pair: KashiMediumRiskLendingPair;
    account: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    repayAmount: string;
    repayMax: boolean;
    removeAmount: string;
    removeMax: boolean;
}

export const repayAsset = createAsyncThunk("usmLending/repayAsset", async ({
    pair, 
    account, 
    networkID, 
    provider, 
    repayAmount,
    repayMax,
    removeAmount,
    removeMax
}: IRepayAssetAndRemoveCollateral, { dispatch, rejectWithValue }) => {
    const addresses = getAddresses(networkID);
    const usmContract = new ethers.Contract(addresses.USM_ADDREESS, USMContract, provider.getSigner())

    const assetToken = unwrappedToken(pair.asset.token)
    const collateralToken = unwrappedToken(pair.collateral.token)
    const removeAmountCurrencyAmount = tryParseAmount(removeAmount, collateralToken)
    const repayAmountCurrencyAmount = tryParseAmount(repayAmount, assetToken)

    const usmAllowance = await usmContract.allowance(account, addresses.BENTOBOX_ADDRESS)
    const parsedCollateralAmount = ethers.utils.parseUnits(repayAmount, 18)

    let approveTx
    if (parsedCollateralAmount.gt(usmAllowance)) {
        try {
            console.log("approve usm to bentoBox: ", usmAllowance.toString(), parsedCollateralAmount.toString())
            approveTx = await usmContract.approve(addresses.BENTOBOX_ADDRESS, ethers.constants.MaxUint256)
            dispatch(
                fetchPendingTxns({
                    txnHash: approveTx.hash,
                    text: "Approving",
                    type: "USM to BentoBox",
                }),
            )
            await approveTx.wait()
        } catch(err: any) {
            metamaskErrorWrap(err, dispatch);
            return rejectWithValue(false)
        } finally {
            if (approveTx) {
                dispatch(clearPendingTxn(approveTx.hash));
            }
        }
    }

    if (removeAmountCurrencyAmount && repayAmountCurrencyAmount) {
        let repayTx
        try {
            repayTx = await repayAssetExecute({
                pair,
                repayAmount: repayAmountCurrencyAmount,
                repayMax,
                removeAmount: removeAmountCurrencyAmount,
                removeMax,
                provider,
                chainId: networkID,
                account
            });

            if (repayTx) {
                dispatch(
                    fetchPendingTxns({
                        txnHash: repayTx.hash,
                        text: "Repaying",
                        type: "Repaying USM",
                    }),
                )
                await repayTx?.wait()

                dispatch(
                    getMintBalances({
                        address: account,
                        networkID: networkID,
                        provider
                    })
                )

                dispatch(
                    getUsmAccountStatus({
                        account,
                        networkID,
                        provider
                    })
                )

                dispatch(success({ text: messages.tx_successfully_send }));
            } else {
                throw "Rejected transaction";
            }
        } catch(err: any) {
            metamaskErrorWrap(err, dispatch);
            return rejectWithValue(false)
        } finally {
            if (repayTx) {
                dispatch(clearPendingTxn(repayTx.hash));
            }
        }
    }
});

const initialState: IUsmLendingSlice = {
    loading: true,
    rejected: false,
    total: {
        collateralAmount: undefined,
        borrowedAmount: undefined,
        lentAmount: undefined,
        marketHealth: undefined
    },
    account: {
        kashiPair: undefined,
        assetAmount: undefined,
        approvedKashiInBentoBox: false,
        collateralAmount: undefined,
        borrowedAmount: undefined,
        health: "0"
    }
}

const usmLendingSlice = createSlice({
    name: "usmLending",
    initialState,
    reducers: {
        fetchLendingBalances(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(getUsmAccountStatus.pending, state => {
                state.loading = true;
            })
            .addCase(getUsmAccountStatus.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(getUsmAccountStatus.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(depositAndLendAsset.pending, state => {
                state.loading = true;
                state.rejected = false
            })
            .addCase(depositAndLendAsset.fulfilled, state => {
                state.loading = true;
                state.rejected = false
            })
            .addCase(depositAndLendAsset.rejected, (state, { error }) => {
                state.loading = false;
                state.rejected = true
                console.log(error);
            })
            .addCase(withdrawAsset.pending, state => {
                state.loading = true;
                state.rejected = false
            })
            .addCase(withdrawAsset.fulfilled, state => {
                state.loading = true;
                state.rejected = false
            })
            .addCase(withdrawAsset.rejected, (state, { error }) => {
                state.loading = false;
                state.rejected = true
                console.log(error);
            })
            .addCase(borrowAsset.pending, state => {
                state.loading = true;
                state.rejected = false;
            })
            .addCase(borrowAsset.fulfilled, state => {
                state.loading = false;
                state.rejected = false;
            })
            .addCase(borrowAsset.rejected, (state, { error }) => {
                state.loading = false;
                state.rejected = true;
                console.log(error);
            })
            .addCase(repayAsset.pending, state => {
                state.loading = true;
            })
            .addCase(repayAsset.fulfilled, state => {
                state.loading = false;
                state.rejected = false;
            })
            .addCase(repayAsset.rejected, (state, { error }) => {
                state.loading = false;
                state.rejected = true;
                console.log(error);
            })
    }
})

export default usmLendingSlice.reducer;

export const { fetchLendingBalances } = usmLendingSlice.actions;

const baseInfo = (state: RootState) => state.usmLending;

export const getUsmLendingState = createSelector(baseInfo, usmLending => usmLending);