import { BigNumber, ethers } from "ethers";
import { useCallback } from "react";
import { RedeemContract, StakingContract, USMMintContract } from "src/abi";
import { getAddresses } from "src/constants";
import { getGasPrice } from "src/helpers/get-gas-price";
import { useWeb3Context } from "../web3";

function useGasFee() {
    const { provider, chainID } = useWeb3Context();

    const calculateGasFee = async (gasPrice: BigNumber, gasLimit: BigNumber) => {
        return ethers.utils.formatEther(gasPrice.mul(gasLimit));
    };

    // Stake into contract
    const getStakeD33DGasFee = useCallback(async (value: string, address: string) => {
        const addresses = getAddresses(chainID);
        const contractAddress = addresses.STAKING_ADDRESS;
        const contract = new ethers.Contract(contractAddress, StakingContract, provider.getSigner());

        const gasPrice = await getGasPrice(provider);
        const gasLimit = await contract.estimateGas.stake(ethers.utils.parseUnits(value), address);

        const gasFee = await calculateGasFee(gasPrice, gasLimit);
        return gasFee;
    }, []);

    // Redeem from contract
    const getStakeRedeemGasFee = useCallback(async () => {
        const addresses = getAddresses(chainID);
        const contractAddress = addresses.STAKING_ADDRESS;
        const contract = new ethers.Contract(contractAddress, StakingContract, provider.getSigner());

        const gasPrice = await getGasPrice(provider);
        const gasLimit = await contract.estimateGas.claimRewards();

        const gasFee = await calculateGasFee(gasPrice, gasLimit);
        return gasFee;
    }, []);

    // Purchase Bond
    const getPurchaseBondGasFee = useCallback(async (bond: any, value: string, address: string, slippage: number, useEth: boolean) => {
        const bondContract = bond.getContractForBond(chainID, provider.getSigner());
        const gasPrice = await getGasPrice(provider);

        const calculatePremium = await bondContract.bondPrice();
        const acceptedSlippage = slippage / 100 || 0.005;
        const maxPremium = Math.round(calculatePremium * (1 + acceptedSlippage));

        const depositorAddress = address;

        let gasLimit;
        if (!bond.isNFT) {
            const _value = Number(value) * 10000; // for decimal values, like 0.05 eth
            const valueInWei = BigNumber.from(_value)
                .mul(BigNumber.from(10).pow(BigNumber.from(bond.reserveDecimals)))
                .div(BigNumber.from(10000));

            if (useEth) {
                gasLimit = await bondContract.estimateGas.deposit(valueInWei.toString(), maxPremium.toString(), depositorAddress, { value: valueInWei.toString() });
            } else {
                gasLimit = await bondContract.estimateGas.deposit(valueInWei.toString(), maxPremium.toString(), depositorAddress);
            }
        } else {
            // value is token id
            gasLimit = await bondContract.estimateGas.deposit(value, maxPremium.toString(), depositorAddress);
        }

        const gasFee = await calculateGasFee(gasPrice, gasLimit);
        return gasFee;
    }, []);

    // Redeem Bond
    const getRedeemBondGasFee = useCallback(async (bond: any, autostake: boolean = false, address: string) => {
        const bondContract = bond.getContractForBond(chainID, provider.getSigner());
        const gasPrice = await getGasPrice(provider);
        const gasLimit = await bondContract.estimateGas.redeem(address, autostake);
        const gasFee = await calculateGasFee(gasPrice, gasLimit);
        return gasFee;
    }, []);

    // Redeem pD33D
    const getRedeemPD33D = useCallback(async (amount: string, signature: string, stake: boolean) => {
        try {
            const addresses = getAddresses(chainID);
            const contractAddress = addresses.REDEEM_ADDRESS;
            const contract = new ethers.Contract(contractAddress, RedeemContract, provider.getSigner());

            const finalSignature = signature.length > 0 ? signature : [];

            const gasLimit = await contract.estimateGas.redeem(ethers.utils.parseUnits(amount), finalSignature, stake);
            const gasPrice = await getGasPrice(provider);
            const gasFee = await calculateGasFee(gasPrice, gasLimit);

            return gasFee;
        } catch (err) {
            console.log("Address not being whitelist either on-chain or off-chain");
            return Number(0).toString();
        }
    }, []);

    //Mint USM
    const getMintUSM = useCallback(async (amount: string, token: number, address: string) => {
        const addresses = getAddresses(chainID);
        const signer = provider.getSigner();
        const mintContract = new ethers.Contract(addresses.USM_MINTER, USMMintContract, signer);
        const newAmount = ethers.utils.parseUnits(amount, 18);

        try {
            if (token === 1) {
                const gasLimit = await mintContract.estimateGas.mintWithD33d(newAmount, address);
                const gasPrice = await getGasPrice(provider);
                const gasFee = await calculateGasFee(gasPrice, gasLimit);
                return gasFee;
            } else if (token === 2) {
                const gasLimit = await mintContract.estimateGas.mintWithDvd(newAmount, address);
                const gasPrice = await getGasPrice(provider);
                const gasFee = await calculateGasFee(gasPrice, gasLimit);

                return gasFee;
            }
        } catch (err) {
            console.log("Not eligble probably");
            return Number(0).toString();
        }
    }, []);

    return {
        getStakeD33DGasFee,
        getStakeRedeemGasFee,
        getPurchaseBondGasFee,
        getRedeemBondGasFee,
        getRedeemPD33D,
        getMintUSM,
    };
}

export default useGasFee;
