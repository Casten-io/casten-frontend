import { ContractInterface } from "ethers";
import { Bond, BondOpts } from "./bond";
import { BondType } from "./constants";
import { Networks } from "../../constants/blockchain";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { getBondCalculator } from "../bond-calculator";
import { getAddresses } from "../../constants/addresses";

// Keep all LP specific fields/logic within the LPBond class
export interface LPBondOpts extends BondOpts {
    readonly reserveContractAbi: ContractInterface;
    readonly lpUrl: string;
    readonly displayUnits?: string;
}

export class LPBond extends Bond {
    readonly isLP = true;
    readonly isNFT = false;
    readonly lpUrl: string;
    readonly reserveContractAbi: ContractInterface;
    readonly displayUnits: string;

    constructor(lpBondOpts: LPBondOpts) {
        super(BondType.LP, lpBondOpts);

        this.lpUrl = lpBondOpts.lpUrl;
        this.reserveContractAbi = lpBondOpts.reserveContractAbi;
        this.displayUnits = lpBondOpts.displayUnits || "LP";
    }

    async getTreasuryBalance(networkID: Networks, provider: StaticJsonRpcProvider) {
        const addresses = getAddresses(networkID);

        const token = this.getContractForReserve(networkID, provider);
        const tokenAddress = this.getAddressForReserve(networkID);
        const bondCalculator = getBondCalculator(networkID, provider, this.name);
        const tokenAmount = await token.balanceOf(addresses.TREASURY_ADDRESS);
        const valuation = await bondCalculator.valuation(tokenAddress, tokenAmount);
        const markdown = await bondCalculator.markdown(tokenAddress);
        const tokenUSD = (valuation / Math.pow(10, 18)) * (markdown / Math.pow(10, 18));

        return tokenUSD;
    }

    public getTokenAmount(networkID: Networks, provider: StaticJsonRpcProvider) {
        return this.getReserves(networkID, provider, true);
    }

    public getD33DAmount(networkID: Networks, provider: StaticJsonRpcProvider) {
        return this.getReserves(networkID, provider, false);
    }

    private async getReserves(networkID: Networks, provider: StaticJsonRpcProvider, isToken: boolean): Promise<number> {
        const token = this.getContractForReserve(networkID, provider);
        let [reserve0, reserve1] = await token.getReserves();
        return (isToken ? reserve0 : reserve1) / Math.pow(10, 18);
    }
}

// Mana is ERC20, but it uses Calculator contract like LP bond
export interface ManaBondOpts extends LPBondOpts {}

export class ManaBond extends LPBond {
    constructor(manaBondOpts: CustomLPBondOpts) {
        super(manaBondOpts);

        this.getTreasuryBalance = async (networkID: Networks, provider: StaticJsonRpcProvider) => {
            const addresses = getAddresses(networkID);
            const token = this.getContractForReserve(networkID, provider);
            const tokenAddress = this.getAddressForReserve(networkID);
            const bondCalculator = getBondCalculator(networkID, provider, this.name);
            const tokenAmount = await token.balanceOf(addresses.TREASURY_ADDRESS);
            const valuation = await bondCalculator.valuation(tokenAddress, tokenAmount);
            const tokenUSD = valuation / Math.pow(10, this.reserveDecimals);
            return tokenUSD;
        }

        this.getTokenAmount = async (networkID: Networks, provider: StaticJsonRpcProvider) => {
            const addresses = getAddresses(networkID);
            const token = this.getContractForReserve(networkID, provider);
            const tokenAmount = await token.balanceOf(addresses.TREASURY_ADDRESS);
            return tokenAmount / Math.pow(10, this.reserveDecimals);
        };

        this.getD33DAmount = async (networkID: Networks, provider: StaticJsonRpcProvider) => {
            return new Promise<number>(reserve => reserve(0));
        }
    }
}


// These are special bonds that have different valuation methods
export interface CustomLPBondOpts extends LPBondOpts {}

export class CustomLPBond extends LPBond {
    constructor(customBondOpts: CustomLPBondOpts) {
        super(customBondOpts);

        this.getTreasuryBalance = async (networkID: Networks, provider: StaticJsonRpcProvider) => {
            const tokenAmount = await super.getTreasuryBalance(networkID, provider);
            const tokenPrice = this.getTokenPrice();

            return tokenAmount * tokenPrice;
        };

        this.getTokenAmount = async (networkID: Networks, provider: StaticJsonRpcProvider) => {
            const tokenAmount = await super.getTokenAmount(networkID, provider);
            const tokenPrice = this.getTokenPrice();

            return tokenAmount * tokenPrice;
        };
    }
}
