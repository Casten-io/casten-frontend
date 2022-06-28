import { ethers } from "ethers";
import { getAddresses } from "../../constants";
import { D33DTokenContract, fsD33DTokenContract, gD33DTokenContract, MimTokenContract, DistributorContract, StakingContract } from "../../abi";
import { setAll } from "../../helpers";

import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Bond } from "../../helpers/bond/bond";
import { Networks } from "../../constants/blockchain";
import { RootState } from "../store";
import { IToken } from "../../helpers/tokens";
import { Redeem } from "@material-ui/icons";

interface IGetBalances {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IAccountBalances {
    balances: {
        gD33d: string;
        d33d: string;
        totalStaked: string;
    };
}

export const getBalances = createAsyncThunk("account/getBalances", async ({ address, networkID, provider }: IGetBalances): Promise<IAccountBalances> => {
    const addresses = getAddresses(networkID);
    const gD33DContract = new ethers.Contract(addresses.GD33D_ADDRESS, gD33DTokenContract, provider);
    let gD33dBalance = await gD33DContract.balanceOf(address);
    let unstakeAllowance = await gD33DContract.allowance(address, addresses.STAKING_ADDRESS);

    const d33dContract = new ethers.Contract(addresses.D33D_ADDRESS, fsD33DTokenContract, provider);
    const d33dBalance = await d33dContract.balanceOf(address);

    const stakingContract = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, provider);
    const userInfo = await stakingContract.userInfo(address);

    return {
        balances: {
            gD33d: ethers.utils.formatUnits(gD33dBalance, 18),
            d33d: ethers.utils.formatUnits(d33dBalance, 18),
            totalStaked: ethers.utils.formatUnits(userInfo.deposit, 18),
        },
    };
});

interface ILoadAccountDetails {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IUserAccountDetails {
    balances: {
        d33d: string;
        gD33d: string;
        totalStaked: string;
    };
    staking: {
        d33d: number;
        gD33d: number;
    };
    exchange: {
        gd33d: number;
    };
    nextRewardAmount: number;
    rewards: {
        total: number;
        penalty: number;
        withdrawn: number;
        rewardInUSM: number;
    };
    lockUpEndTime: number;
}

export const loadAccountDetails = createAsyncThunk("account/loadAccountDetails", async ({ networkID, provider, address }: ILoadAccountDetails): Promise<IUserAccountDetails> => {
    let d33dBalance = 0;
    let fsD33dBalance = 0;
    let currentD33D = ethers.BigNumber.from(0);
    let gD33dBalance = 0;
    let exchangeRate = 0;
    let nextRewardAmount = 0;
    let rewardInUSM = 0;

    let stakeAllowance = 0;
    let unstakeAllowance = 0;
    let forceClaimInfo = {
        rewards_: 0,
        penalty_: 0,
        withdrawn_: 0,
    };
    let userInfo = {
        gons: 0,
        deposit: 0,
    };
    let stakingIds = {
        first_: 0,
        end_: 0,
    };
    let depositInfo = [0, 0, 0];

    const addresses = getAddresses(networkID);

    if (addresses.D33D_ADDRESS) {
        const d33dContract = new ethers.Contract(addresses.D33D_ADDRESS, D33DTokenContract, provider);
        d33dBalance = await d33dContract.balanceOf(address);
        stakeAllowance = await d33dContract.allowance(address, addresses.STAKING_ADDRESS);
    }
    if (addresses.FSD33D_ADDRESS) {
        const fsD33DContract = new ethers.Contract(addresses.FSD33D_ADDRESS, fsD33DTokenContract, provider);
        currentD33D = await fsD33DContract.balanceForGons(address);
    }
    if (addresses.GD33D_ADDRESS) {
        const gD33DContract = new ethers.Contract(addresses.GD33D_ADDRESS, gD33DTokenContract, provider);
        gD33dBalance = await gD33DContract.balanceOf(address);
        unstakeAllowance = await gD33DContract.allowance(address, addresses.STAKING_ADDRESS);
    }

    // if (addresses.GD33D_ADDRESS) {
    //     const gD33DContract = new ethers.Contract(addresses.GD33D_ADDRESS, gD33DTokenContract, provider);
    //     exchangeRate = (await gD33DContract.balanceFrom("1000000")) / 1000000;
    // }

    if (addresses.DISTRIBUTOR_ADDRESS) {
        const distributorContract = new ethers.Contract(addresses.DISTRIBUTOR_ADDRESS, DistributorContract, provider);
        nextRewardAmount = (await distributorContract.nextRewardFor(address)) / Math.pow(10, 18);
    }

    if (addresses.STAKING_ADDRESS) {
        const stakingContract = new ethers.Contract(addresses.STAKING_ADDRESS, StakingContract, provider);
        const [deposit] = await stakingContract.warmupInfo(address);
        let rewardInUSM = 0
        if(currentD33D.gt(deposit)) {
            let rewardInD33D = currentD33D.sub(deposit);

            let usmMinter = await stakingContract.usmMinter()
            rewardInUSM = usmMinter.getAmountOut(addresses.D33D_ADDRESS, rewardInD33D)
        }
    }

    return {
        balances: {
            gD33d: ethers.utils.formatUnits(gD33dBalance, 18),
            d33d: ethers.utils.formatUnits(d33dBalance, 18),
            totalStaked: ethers.utils.formatUnits(userInfo.deposit, 18),
        },
        staking: {
            d33d: Number(stakeAllowance),
            gD33d: Number(unstakeAllowance),
        },
        exchange: {
            gd33d: Number(exchangeRate),
        },
        nextRewardAmount: Number(nextRewardAmount),
        rewards: {
            total: forceClaimInfo.rewards_ / Math.pow(10, 18),
            penalty: forceClaimInfo.penalty_ / Math.pow(10, 18),
            withdrawn: forceClaimInfo.withdrawn_ / Math.pow(10, 18),
            rewardInUSM: rewardInUSM / Math.pow(10, 18),
        },
        lockUpEndTime: depositInfo[2],
    };
});

interface ICalcUserBondDetails {
    address: string;
    bond: Bond;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IUserBondDetails {
    allowance: number;
    balance: number;
    ethBalance: number;
    interestDue: number;
    bondMaturationBlock: number;
    pendingPayout: number; //Payout formatted in gwei.
}

export const calculateUserBondDetails = createAsyncThunk("account/calculateUserBondDetails", async ({ address, bond, networkID, provider }: ICalcUserBondDetails) => {
    if (!address) {
        return new Promise<any>(resolve => {
            resolve({
                bond: "",
                displayName: "",
                bondIconSvg: "",
                isLP: false,
                allowance: 0,
                balance: 0,
                interestDue: 0,
                bondMaturationBlock: 0,
                pendingPayout: "",
                ethBalance: 0,
            });
        });
    }

    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let interestDue, pendingPayout, bondMaturationBlock;

    const bondDetails = await bondContract.bondInfo(address);
    interestDue = bondDetails.payout / Math.pow(10, 18);
    bondMaturationBlock = Number(bondDetails.vesting) + Number(bondDetails.lastTimestamp);
    pendingPayout = await bondContract.pendingPayoutFor(address);

    let allowance,
        balance = "0";
    if (!bond.isNFT) {
        allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    } else {
        let _allowance = await reserveContract.isApprovedForAll(address, bond.getAddressForBond(networkID));
        allowance = _allowance ? 1 : 0;
    }
    balance = await reserveContract.balanceOf(address);
    const balanceVal = bond.isNFT ? Number(balance) : Number(balance) / Math.pow(10, bond.reserveDecimals);

    const ethBalance = await provider.getSigner().getBalance();
    const ethVal = ethers.utils.formatEther(ethBalance);

    const pendingPayoutVal = ethers.utils.formatUnits(pendingPayout, 18);

    return {
        bond: bond.name,
        displayName: bond.displayName,
        bondIconSvg: bond.bondIconSvg,
        isLP: bond.isLP,
        allowance: Number(allowance),
        balance: Number(balanceVal),
        ethBalance: Number(ethVal),
        interestDue,
        bondMaturationBlock,
        pendingPayout: Number(pendingPayoutVal),
    };
});

interface ICalcUserTokenDetails {
    address: string;
    token: IToken;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IUserTokenDetails {
    allowance: number;
    balance: number;
    isEth?: boolean;
}

export const calculateUserTokenDetails = createAsyncThunk("account/calculateUserTokenDetails", async ({ address, token, networkID, provider }: ICalcUserTokenDetails) => {
    if (!address) {
        return new Promise<any>(resolve => {
            resolve({
                token: "",
                address: "",
                img: "",
                allowance: 0,
                balance: 0,
            });
        });
    }

    if (token.isEth) {
        const ethBalance = await provider.getSigner().getBalance();
        const ethVal = ethers.utils.formatEther(ethBalance);

        return {
            token: token.name,
            tokenIcon: token.img,
            balance: Number(ethVal),
            isEth: true,
        };
    }

    const addresses = getAddresses(networkID);

    const tokenContract = new ethers.Contract(token.address, MimTokenContract, provider);

    let allowance,
        balance = "0";

    allowance = 0; // await tokenContract.allowance(address, addresses.ZAPIN_ADDRESS); [TODO]
    balance = await tokenContract.balanceOf(address);

    const balanceVal = Number(balance) / Math.pow(10, token.decimals);

    return {
        token: token.name,
        address: token.address,
        img: token.img,
        allowance: Number(allowance),
        balance: Number(balanceVal),
    };
});

export interface IAccountSlice {
    bonds: { [key: string]: IUserBondDetails };
    balances: {
        gD33d: string;
        d33d: string;
        totalStaked: string;
    };
    loading: boolean;
    staking: {
        d33d: number;
        gD33d: number;
    };
    tokens: { [key: string]: IUserTokenDetails };
    exchange: {
        gd33d: number;
    };
    nextRewardAmount: number;
    rewards: {
        total: number;
        penalty: number;
        withdrawn: number;
        rewardInUSM: number;
    };
    lockUpEndTime: number;
}

const initialState: IAccountSlice = {
    loading: true,
    bonds: {},
    balances: { gD33d: "", d33d: "", totalStaked: "" },
    staking: { d33d: 0, gD33d: 0 },
    tokens: {},
    exchange: { gd33d: 0 },
    nextRewardAmount: 0,
    rewards: {
        total: 0,
        penalty: 0,
        withdrawn: 0,
        rewardInUSM: 0,
    },
    lockUpEndTime: 0,
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        fetchAccountSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAccountDetails.pending, state => {
                state.loading = true;
            })
            .addCase(loadAccountDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAccountDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(getBalances.pending, state => {
                state.loading = true;
            })
            .addCase(getBalances.fulfilled, (state, action) => {
                setAll(state, action.payload);
                console.log("Success");
                console.log(action.payload);
                state.loading = false;
            })
            .addCase(getBalances.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calculateUserBondDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
                if (!action.payload) return;
                const bond = action.payload.bond;
                state.bonds[bond] = action.payload;
                state.loading = false;
            })
            .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
        /*
            .addCase(calculateUserTokenDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(calculateUserTokenDetails.fulfilled, (state, action) => {
                if (!action.payload) return;
                const token = action.payload.token;
                state.tokens[token] = action.payload;
                state.loading = false;
            })
            .addCase(calculateUserTokenDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
            */
    },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
