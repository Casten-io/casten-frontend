import { useMemo } from "react";
import { Contract, ethers } from "ethers";
import { useSelector } from "react-redux";

import { Address } from "../constants/address";
import { ADDRESS_BY_NETWORK_ID } from "../constants/address";
import { RootState } from "../store";
import { useWallet } from '../contexts/WalletContext';

const useTokenContact = <T extends Contract = Contract>(tokenAddress: string): T | null => {
  const networkInfo = useSelector(
    (state: RootState) => state.account.networkInfo,
  );
  const { provider } = useWallet();
  const address = useSelector((state: RootState) => state.account.address);
  const chainId = networkInfo?.chainId || 137
  const contractInfo = useMemo(() => {
    return ADDRESS_BY_NETWORK_ID[chainId.toString() as Address]
  }, [chainId]);
  return useMemo(() => {
    if (!address || !provider || !networkInfo) {
      return null
    }

    try {
      return new Contract(tokenAddress, contractInfo.DAI_TOKEN.ABI, provider)
    } catch (error) {
      console.error('Failed To Get Contract', error)

      return null
    }
  }, [address, provider, networkInfo, tokenAddress, contractInfo.DAI_TOKEN.ABI]) as T
}

export default useTokenContact
