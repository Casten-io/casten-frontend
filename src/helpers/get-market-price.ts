import { ethers } from "ethers";
import { LpReserveContract } from "../abi";
import { usdcD33D } from "../helpers/bond";
import { Networks } from "../constants/blockchain";

export async function getMarketPrice(networkID: Networks, provider: ethers.Signer | ethers.providers.Provider): Promise<number> {
    const usdcD33DAddress = usdcD33D.getAddressForReserve(networkID);
    const pairContract = new ethers.Contract(usdcD33DAddress, LpReserveContract, provider);
    const reserves = await pairContract.getReserves();
    const marketPrice = reserves[0] / reserves[1]; // [TODO] usdc-reserve / d33d-reserve
    return marketPrice;
}
