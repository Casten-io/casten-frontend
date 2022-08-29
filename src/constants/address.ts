import JUNIOR_OPERATOR_ABI from "../abis/jrOperator.json";
import SHELF_ABI from "../abis/jrOperator.json";
import JUNIOR_TOKEN_ABI from "../abis/juniorToken.json";
import SENIOR_TOKEN_ABI from "../abis/seniorToken.json";
import {ethers} from "ethers";


export type Address = "80001"

export type Contracts = "SHELF" | "JUNIOR_OPERATOR" | "JUNIOR_TOKEN" | "SENIOR_TOKEN"

type ContractRecord =  Record<Contracts, {
    address: string,
    ABI: ethers.ContractInterface
}>

export const ADDRESS_BY_NETWORK_ID: Record<Address, ContractRecord> = {
    "80001": {
        SHELF:  {
            address: "0x459A7C7dF9F128863710A652AA9026Fe3E809DE6",
            ABI: JUNIOR_OPERATOR_ABI
        },
        JUNIOR_OPERATOR: {
            address: "0x2cFC555dE9D265E849b9a30002E8958249FA9737",
            ABI: SHELF_ABI
        },
        JUNIOR_TOKEN: {
            address: "0xDc27F7B1eb43FfFf707A6E128a29eDd8E60886D9",
            ABI: JUNIOR_TOKEN_ABI
        },
        SENIOR_TOKEN: {
            address: "0x13e1aD4B5F76DA46b68F91bC55A11591e6dA813f",
            ABI: SENIOR_TOKEN_ABI
        }
    }
}