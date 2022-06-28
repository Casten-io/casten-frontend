import { ContractInterface } from "ethers";
import { Bond, BondOpts } from "./bond";
import { BondType } from "./constants";
import { Networks } from "../../constants/blockchain";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { getBondCalculator } from "../bond-calculator";
import { getAddresses } from "../../constants/addresses";

// Keep all LP specific fields/logic within the LPBond class
export interface NFTBondOpts extends BondOpts {
    readonly reserveContractAbi: ContractInterface;
    readonly displayUnits: string;
}

export class NFTBond extends Bond {
    readonly isLP = false;
    readonly isNFT = true;
    readonly reserveContractAbi: ContractInterface;
    readonly displayUnits: string;

    constructor(nftBondOpts: NFTBondOpts) {
        super(BondType.NFT, nftBondOpts);

        this.reserveContractAbi = nftBondOpts.reserveContractAbi;
        this.displayUnits = nftBondOpts.displayUnits || "LP";
    }

    async getTreasuryBalance(networkID: Networks, provider: StaticJsonRpcProvider) {
        const addresses = getAddresses(networkID);
        const token = this.getContractForReserve(networkID, provider);
        const bondContract = this.getContractForBond(networkID, provider);
        const tokenAmount = await token.balanceOf(addresses.TREASURY_ADDRESS);
        const tokenPrice = await bondContract.getPrice();
        const tokenUSD = tokenAmount * tokenPrice[1] / Math.pow(10, 18);
        return tokenUSD;
    }

    async getTokenAmount(networkID: Networks, provider: StaticJsonRpcProvider) {
        const addresses = getAddresses(networkID);
        const token = this.getContractForReserve(networkID, provider);
        const tokenAmount = await token.balanceOf(addresses.TREASURY_ADDRESS);
        return tokenAmount;
    };

    async getD33DAmount (networkID: Networks, provider: StaticJsonRpcProvider) {
        return new Promise<number>(reserve => reserve(0));
    }
}
