import { Networks } from "../../constants/blockchain";
import { LPBond, CustomLPBond, ManaBond } from "./lp-bond";
import { StableBond, CustomBond } from "./stable-bond";
import { NFTBond } from "./nft-bond";

import UsdcIcon from "../../assets/tokens/USDC.e.png";
import UsdtIcon from "../../assets/tokens/USDT.e.png";
import ManaIcon from "../../assets/tokens/MANA.png";
import SandIcon from "../../assets/tokens/SAND.png";
import EthIcon from "../../assets/tokens/ETH.e.png";
import D33dUsdcIcon from "../../assets/tokens/D33D-USDC.png";

import { 
    StableBondContract, 
    LpBondContract, 
    NftBondContract,
    StableReserveContract, 
    LpReserveContract,
    NftReserveContract,
    EthBondContract
} from "../../abi";

export const usdc = new StableBond({
    name: "usdc",
    displayName: "USDC",
    bondToken: "USDC",
    bondIconSvg: UsdcIcon,
    bondContractABI: StableBondContract,
    reserveContractAbi: StableReserveContract,
    reserveDecimals: 6,
    networkAddrs: {
        [Networks.ETH]: {
            bondAddress: "0x054b19e27A131CC11Ba0185B3C36067a379c3C74",
            reserveAddress: "0xdf5324ebe6f6b852ff5cbf73627ee137e9075276",
        },
    },
    tokensInStrategy: "0",
    allowedHappyHour: true,
});

export const usdt = new StableBond({
    name: "usdt",
    displayName: "USDT",
    bondToken: "USDT",
    bondIconSvg: UsdtIcon,
    bondContractABI: StableBondContract,
    reserveContractAbi: StableReserveContract,
    reserveDecimals: 6,
    networkAddrs: {
        [Networks.ETH]: {
            bondAddress: "0x44294B24E72A9c5583E78dDbC99eE3afceE54438",
            reserveAddress: "0x057305Eb5B8bb21eFdb7AfaCB383CB366514A999",
        },
    },
    tokensInStrategy: "0",
    allowedHappyHour: true,
});

export const eth = new ManaBond({
    name: "eth",
    displayName: "ETH",
    bondToken: "ETH",
    bondIconSvg: EthIcon,
    bondContractABI: EthBondContract,
    reserveContractAbi: LpReserveContract,
    reserveDecimals: 18,
    displayUnits: "ETH",
    networkAddrs: {
        [Networks.ETH]: {
            bondAddress: "0xD25E020a165306d1bB6434ff9Ef0bbC6f906628A",
            reserveAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
        },
    },
    lpUrl: "",
    allowedHappyHour: false,
});

export const mana = new ManaBond({
    name: "mana",
    displayName: "MANA",
    bondToken: "MANA",
    bondIconSvg: ManaIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    reserveDecimals: 18,
    displayUnits: "MANA",
    networkAddrs: {
        [Networks.ETH]: {
            bondAddress: "0xc011203201D31736aB058bd000218F54b85E1be3",
            reserveAddress: "0x28389Af66C9e2E007D0C75e452aFee13Ae1e5e82",
        },
    },
    lpUrl: "",
    allowedHappyHour: true,
});

export const sand = new ManaBond({
    name: "sand",
    displayName: "SAND",
    bondToken: "SAND",
    bondIconSvg: SandIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    reserveDecimals: 18,
    displayUnits: "SAND",
    networkAddrs: {
        [Networks.ETH]: {
            bondAddress: "0x20CD4dA9AC071E2962459662B652b971885C00d6",
            reserveAddress: "0xe6c1f7b22d79b870e011a8b4833c95048f51d9f9",
        },
    },
    lpUrl: "",
    allowedHappyHour: true,
});

export const usdcD33D = new LPBond({
    name: "usdc_d33d_lp",
    displayName: "D33D-USDC LP",
    bondToken: "USDC",
    bondIconSvg: D33dUsdcIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    reserveDecimals: 18,
    networkAddrs: {
        [Networks.ETH]: {
            bondAddress: "0x4E518f870c3082e49c18e22d63d11E2Ac6676E4f",
            reserveAddress: "0xcAC4c813535847A6801f55300d145883f0EC3247",
        },
    },
    lpUrl: "rinkeby.etherscan.io/address/0xcAC4c813535847A6801f55300d145883f0EC3247",
    allowedHappyHour: true,
});
/*
export const ethD33D = new CustomLPBond({
    name: "eth_d33d_lp",
    displayName: "D33D-ETH LP",
    bondToken: "ETH",
    bondIconSvg: AvaxTimeIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    reserveDecimals: 18,
    networkAddrs: {
        [Networks.ETH]: {
            bondAddress: "0xc26850686ce755FFb8690EA156E5A6cf03DcBDE1",
            reserveAddress: "0xf64e1c5B6E17031f5504481Ac8145F4c3eab4917",
        },
    },
    lpUrl: "https://www.traderjoexyz.com/#/pool/AVAX/0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
});
*/

export const sandboxNFT = new NFTBond({
    name: "sandbox",
    displayName: "Sandbox NFT",
    bondToken: "sandbox",
    bondIconSvg: SandIcon,
    bondContractABI: NftBondContract,
    reserveContractAbi: NftReserveContract,
    reserveDecimals: 18,
    networkAddrs: {
        [Networks.ETH]: {
            bondAddress: "0x8CBa62Fc2478cdc041D1DdbF511ca265AeBcF8D5",
            reserveAddress: "0x4EbaC3f7e0E17e427AB7add7460580328f56e448",
        },
    },
    displayUnits: "SANDBOX",
    allowedHappyHour: true,
})

export const decentralandNFT = new NFTBond({
    name: "decentraland",
    displayName: "Decentraland NFT",
    bondToken: "decentraland",
    bondIconSvg: ManaIcon,
    bondContractABI: NftBondContract,
    reserveContractAbi: NftReserveContract,
    reserveDecimals: 18,
    networkAddrs: {
        [Networks.ETH]: {
            bondAddress: "0x35B52706732B3148868A23798012994f52d340D1",
            reserveAddress: "0x388bF94a2798894c89d74f5B47b494a96212aE53",
        },
    },
    displayUnits: "Decentraland",
    allowedHappyHour: true,
})

export default [usdc, usdt, eth, mana, sand, usdcD33D, sandboxNFT, decentralandNFT /*,ethD33D*/];
