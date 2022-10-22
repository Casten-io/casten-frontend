import JUNIOR_OPERATOR_ABI from "../abis/jrOperator.json";
import SHELF_ABI from "../abis/jrOperator.json";
import JUNIOR_TOKEN_ABI from "../abis/juniorToken.json";
import SENIOR_TOKEN_ABI from "../abis/seniorToken.json";
import SENIOR_OPERATOR_ABI from "../abis/srOperator.json";
import DAI_TOKEN_ABI from "../abis/daiToken.json";
import SENIOR_TRANCHE from "../abis/seniorTranche.json";
import JUNIOR_TRANCHE from "../abis/juniorTranche.json";
import JUNIOR_MEMBER_LIST from "../abis/jrMemberList.json";
import SENIOR_MEMBER_LIST from "../abis/srMemberList.json";
import {ethers} from "ethers";


export type Address = "80001"

export type Contracts = "SHELF" | "JUNIOR_OPERATOR" | "JUNIOR_TOKEN" | "SENIOR_TOKEN" | "SENIOR_OPERATOR" | "DAI_TOKEN" | "SENIOR_TRANCHE" | "JUNIOR_TRANCHE" | "JUNIOR_MEMBER_LIST" | "SENIOR_MEMBER_LIST"

type ContractRecord =  Record<Contracts, {
    address: string,
    ABI: ethers.ContractInterface
}>

export const ADDRESS_BY_NETWORK_ID: Record<Address, ContractRecord> = {
    "80001": {
        DAI_TOKEN: {
            address: "0xd9ab6653AabCBBdE8844cddcBE63834Ea1698912",
            ABI: DAI_TOKEN_ABI
        },
        SHELF:  {
            address: "0x459A7C7dF9F128863710A652AA9026Fe3E809DE6",
            ABI: JUNIOR_OPERATOR_ABI
        },
        JUNIOR_OPERATOR: {
            address: "0x2cFC555dE9D265E849b9a30002E8958249FA9737",
            ABI: SHELF_ABI
        },
        SENIOR_OPERATOR: {
            address: "0xaF43A94A59D76CE7398fAdf329D64ef50751E035",
            ABI: SENIOR_OPERATOR_ABI
        },
        JUNIOR_TOKEN: {
            address: "0xDc27F7B1eb43FfFf707A6E128a29eDd8E60886D9",
            ABI: JUNIOR_TOKEN_ABI
        },
        SENIOR_TOKEN: {
            address: "0x13e1aD4B5F76DA46b68F91bC55A11591e6dA813f",
            ABI: SENIOR_TOKEN_ABI
        },
        SENIOR_TRANCHE: {
            address: "0x624990A0A74589744ec0F9B7eCa2D781cf008805",
            ABI: SENIOR_TRANCHE
        },
        JUNIOR_TRANCHE: {
            address: "0xd27F7b961008661aae7Bab780Fd4e1C04522295D",
            ABI: JUNIOR_TRANCHE
        },
        JUNIOR_MEMBER_LIST: {
            address: "0x576f1b9aF62bEc5e452A41c1561d97ac4667C597",
            ABI: JUNIOR_MEMBER_LIST
        },
        SENIOR_MEMBER_LIST: {
            address: "0x60f526A1B37aa71726a18E66843450f0A635d481",
            ABI: SENIOR_MEMBER_LIST
        },
    }
}
