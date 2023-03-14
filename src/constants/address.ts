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
import COORDINATOR from '../abis/coordinator.json';
import PILE from '../abis/pile.json';
import {ethers} from "ethers";


export type Address = "80001" | "137"

export type Contracts = "SHELF" | "JUNIOR_OPERATOR" | "JUNIOR_TOKEN" | "SENIOR_TOKEN" | "SENIOR_OPERATOR" | "DAI_TOKEN" | "SENIOR_TRANCHE" | "JUNIOR_TRANCHE" | "JUNIOR_MEMBER_LIST" | "SENIOR_MEMBER_LIST" | "PILE" | "COORDINATOR"

type ContractRecord =  Record<Contracts, {
    address: string,
    ABI: ethers.ContractInterface
    TOKEN_DECIMALS?: number
}>

export const ADDRESS_BY_NETWORK_ID: Record<Address, ContractRecord> = {
    "80001": {
        DAI_TOKEN: {
            address: "0xd9ab6653AabCBBdE8844cddcBE63834Ea1698912",
            ABI: DAI_TOKEN_ABI,
            TOKEN_DECIMALS: 18
        },
        SHELF:  {
            address: "0x459A7C7dF9F128863710A652AA9026Fe3E809DE6",
            ABI: SHELF_ABI
        },
        JUNIOR_OPERATOR: {
            address: "0x2cFC555dE9D265E849b9a30002E8958249FA9737",
            ABI: JUNIOR_OPERATOR_ABI
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
        PILE: {
            address: "0x4A313ef25cB4c2D5f93eB6120ab1379053E67AB1",
            ABI: PILE
        },
        COORDINATOR: {
          address: " 0xBC1029021B42Ca785Ae39F0cCF17E6293af5b6FE",
          ABI: COORDINATOR
        }
    },
    // "137": {
    //     DAI_TOKEN: {
    //         address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    //         ABI: DAI_TOKEN_ABI,
    //         TOKEN_DECIMALS: 6
    //     },
    //     SHELF:  {
    //         address: "0x2fD308b3B7D8A9127F36C7181Fb7732ecF2eFa53",
    //         ABI: SHELF_ABI
    //     },
    //     JUNIOR_OPERATOR: {
    //         address: "0x9737e0ab594C46f5C041A918099918b3c60Bd22F",
    //         ABI: JUNIOR_OPERATOR_ABI
    //     },
    //     SENIOR_OPERATOR: {
    //         address: "0xBE4A1A0BF6819eD7910b69C67762A3Ed1b300F8A",
    //         ABI: SENIOR_OPERATOR_ABI
    //     },
    //     JUNIOR_TOKEN: {
    //         address: "0xAfC87b858b2C186Fc4BbcFC6dA36B689478572D7",
    //         ABI: JUNIOR_TOKEN_ABI
    //     },
    //     SENIOR_TOKEN: {
    //         address: "0xea098164f268EB24775A73355035f57CDf445aF7",
    //         ABI: SENIOR_TOKEN_ABI
    //     },
    //     SENIOR_TRANCHE: {
    //         address: "0xE1b0c2F7Ae965Ea1f9c8A27eAe2827D07895Fa08",
    //         ABI: SENIOR_TRANCHE
    //     },
    //     JUNIOR_TRANCHE: {
    //         address: "0x0667209bD8e95755806E7e11DDd87e6014caBACc",
    //         ABI: JUNIOR_TRANCHE
    //     },
    //     JUNIOR_MEMBER_LIST: {
    //         address: "0xd2540dF4BB6473c6Bb016D3E135858d0f5dE7daB",
    //         ABI: JUNIOR_MEMBER_LIST
    //     },
    //     SENIOR_MEMBER_LIST: {
    //         address: "0xd2540dF4BB6473c6Bb016D3E135858d0f5dE7daB",
    //         ABI: SENIOR_MEMBER_LIST
    //     },
    //     PILE: {
    //         address: "0x30079820d7352DA64a71d4837A98A640c07B6908",
    //         ABI: PILE
    //     },
    //     COORDINATOR: {
    //       address: "0x16b56D03f75849a2A52A8de9fF103cc32c1DB39B",
    //       ABI: COORDINATOR
    //     }
    // }
    // quickcheck old
    // "137": {
    //     DAI_TOKEN: {
    //         address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    //         ABI: DAI_TOKEN_ABI,
    //         TOKEN_DECIMALS: 6
    //     },
    //     SHELF:  {
    //         address: "0xA3EB50Cf1D0047bD08432f9fBDdAE43Bb022f83f",
    //         ABI: SHELF_ABI
    //     },
    //     JUNIOR_OPERATOR: {
    //         address: "0x80ac6C85C18dBaD49894b208b71F738bFb6727d0",
    //         ABI: JUNIOR_OPERATOR_ABI
    //     },
    //     SENIOR_OPERATOR: {
    //         address: "0xcdCAbcdaB768Ea7FB7d5e2c4Ff56bD87de5E1317",
    //         ABI: SENIOR_OPERATOR_ABI
    //     },
    //     JUNIOR_TOKEN: {
    //         address: "0xCa3F9cEFf2da88F3067061268E40ded014dEF2e7",
    //         ABI: JUNIOR_TOKEN_ABI
    //     },
    //     SENIOR_TOKEN: {
    //         address: "0x3dD8C48dAf9850334A798B85f04d75540432De76",
    //         ABI: SENIOR_TOKEN_ABI
    //     },
    //     SENIOR_TRANCHE: {
    //         address: "0xDb178D0cd0D28470a354921E257B9b0988Ff7e38",
    //         ABI: SENIOR_TRANCHE
    //     },
    //     JUNIOR_TRANCHE: {
    //         address: "0x462f9BCF1f552118aB911F803A4eFAae559f6A47",
    //         ABI: JUNIOR_TRANCHE
    //     },
    //     JUNIOR_MEMBER_LIST: {
    //         address: "0x99F43a29ffE37DA242a33EB5DFF5A0f63385CF33",
    //         ABI: JUNIOR_MEMBER_LIST
    //     },
    //     SENIOR_MEMBER_LIST: {
    //         address: "0x99F43a29ffE37DA242a33EB5DFF5A0f63385CF33",
    //         ABI: SENIOR_MEMBER_LIST
    //     },
    //     PILE: {
    //         address: "0xf1dDC889fdFdDa738F0216E7e545a9cC31a02b45",
    //         ABI: PILE
    //     },
    //     COORDINATOR: {
    //         address: "0x94c24bCb5444481C3Ca8Fe33980846fe6401760D",
    //         ABI: COORDINATOR
    //     },
    // }
    // cauris
    "137": {
        DAI_TOKEN: {
            address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            ABI: DAI_TOKEN_ABI,
            TOKEN_DECIMALS: 6
        },
        SHELF:  {
            address: "0x94E9316eBD73d06Fcd8B49029506cc497A0c481d",
            ABI: SHELF_ABI
        },
        JUNIOR_OPERATOR: {
            address: "0x6e39f30B1e9F05915E51D5A6f526268FE0854Fdd",
            ABI: JUNIOR_OPERATOR_ABI
        },
        SENIOR_OPERATOR: {
            address: "0x71b00166bDa4f9FC8E44fB92B86529C530C69227",
            ABI: SENIOR_OPERATOR_ABI
        },
        JUNIOR_TOKEN: {
            address: "0x800ab96e05641a3143a8b2CaF0E33C0Bc61d9FE5",
            ABI: JUNIOR_TOKEN_ABI
        },
        SENIOR_TOKEN: {
            address: "0xfd64c0c6aa73350e7C8886ea8654d4CcDD4c06AD",
            ABI: SENIOR_TOKEN_ABI
        },
        SENIOR_TRANCHE: {
            address: "0xfeE0006935FbF1142aFbF15155932973f0c14973",
            ABI: SENIOR_TRANCHE
        },
        JUNIOR_TRANCHE: {
            address: "0x72E6CDB05A4E688E7f7B082B1312dcB131A9Fd9F",
            ABI: JUNIOR_TRANCHE
        },
        JUNIOR_MEMBER_LIST: {
            address: "0x224643917128d8353fd60b4D90935705CAD58C83",
            ABI: JUNIOR_MEMBER_LIST
        },
        SENIOR_MEMBER_LIST: {
            address: "0x224643917128d8353fd60b4D90935705CAD58C83",
            ABI: SENIOR_MEMBER_LIST
        },
        PILE: {
            address: "0x7D3E923d87405F9E5f2E0EC7D316A8751A357637",
            ABI: PILE
        },
        COORDINATOR: {
            address: "0xF1a44Dc601786FD8766C355d8385Ca62dDFeB9F7",
            ABI: COORDINATOR
        },
    }
}
