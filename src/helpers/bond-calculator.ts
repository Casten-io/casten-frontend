import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { Networks } from "../constants/blockchain";
import { BondingCalcContract } from "../abi";
import { ethers } from "ethers";
import { getAddresses } from "../constants/addresses";

export function getBondCalculator(networkID: Networks, provider: StaticJsonRpcProvider, bondName: string) {
    const addresses = getAddresses(networkID);
    let addr = addresses.MANA_BOND_CALCULATOR_ADDRESS;
    if (bondName === "sand") {
        addr = addresses.SAND_BOND_CALCULATOR_ADDRESS;
    } else if (bondName === "usdc_d33d_lp") {
        addr = addresses.D33D_USDC_BOND_CALCULATOR_ADDRESS;
    } else if (bondName === "eth") {
        addr = addresses.ETH_BOND_CALCULATOR_ADDRESS;
    }
    return new ethers.Contract(addr, BondingCalcContract, provider);
}