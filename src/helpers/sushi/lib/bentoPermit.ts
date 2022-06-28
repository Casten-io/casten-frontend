import { ethers } from "ethers";
import { Signature, splitSignature } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { Web3Provider, JsonRpcProvider } from '@ethersproject/providers'

import { getAddresses } from "src/constants";
import { BentoBoxContract, KashiPairContract } from "src/abi";
import { signMasterContractApproval } from '../kashi/kashiCooker'

export enum BentoApprovalState {
    UNKNOWN,
    NOT_APPROVED,
    PENDING,
    FAILED,
    APPROVED,
}
  
export enum BentoApproveOutcome {
    SUCCESS,
    REJECTED,
    FAILED,
    NOT_READY,
}

export interface BentoPermit {
    outcome: BentoApproveOutcome
    signature?: Signature
    data?: string
}

export interface BentoMasterApproveCallback {
    approvalState: BentoApprovalState
    approve: () => Promise<void>
    getPermit: () => Promise<BentoPermit | undefined>
    permit: BentoPermit | undefined
}

export interface BentoMasterApproveCallbackOptions {
    otherBentoBoxContract?: Contract | null
    contractName?: string
    functionFragment?: string
}

interface IPermitParams {
    masterContract: string
    account: string
    library: JsonRpcProvider | undefined
    chainId: number
}

interface IPermitResult {
    outcome: BentoApproveOutcome
    signature: Signature | undefined
    data: string | undefined
}

export async function getPermit({
    masterContract,
    account,
    library,
    chainId
}: IPermitParams): Promise<IPermitResult> {
    try {
        const bentoBoxContract = new ethers.Contract(
            getAddresses(chainId).BENTOBOX_ADDRESS, 
            BentoBoxContract, 
            library
        )
        const signatureString = await signMasterContractApproval(
          masterContract,
          account,
          library,
          true,
          chainId
        )
  
        const signature = splitSignature(signatureString)
        const permit = {
          outcome: BentoApproveOutcome.SUCCESS,
          signature: splitSignature(signature),
          data: bentoBoxContract?.interface?.encodeFunctionData(
            'setMasterContractApproval',
            [account, masterContract, true, signature.v, signature.r, signature.s]
          ),
        }

        return permit
    } catch (e) {
        return {
          // @ts-ignore TYPE NEEDS FIXING
          outcome: e.code === USER_REJECTED_TX ? BentoApproveOutcome.REJECTED : BentoApproveOutcome.FAILED,
          signature: undefined,
          data: undefined,
        }
    }
}

