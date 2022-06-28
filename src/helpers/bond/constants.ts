import { Networks } from "../../constants/blockchain";

export enum BondType {
    StableAsset,
    LP,
    NFT,
}

export interface BondAddresses {
    reserveAddress: string;
    bondAddress: string;
}

export interface NetworkAddresses {
    [Networks.ETH]: BondAddresses;
}
