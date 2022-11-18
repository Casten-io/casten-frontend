import { useMemo } from "react";
import { Contract } from "ethers";
import { useSelector } from "react-redux";

import { Address } from "../constants/address";
import { ADDRESS_BY_NETWORK_ID } from "../constants/address";
import { RootState } from "../store";

const useTokenContact = <T extends Contract = Contract>(tokenAddress: string): T | null => {
  const networkInfo = useSelector(
    (state: RootState) => state.account.networkInfo,
  );
  const provider = useSelector((state: RootState) => state.account.provider);
  const address = useSelector((state: RootState) => state.account.address);
  const contractInfo =
    ADDRESS_BY_NETWORK_ID[networkInfo?.chainId.toString() as Address | "137"];
  return useMemo(() => {
    if (!address || !provider || !networkInfo) {
      return null
    }

    try {
      return new Contract(tokenAddress, contractInfo.DAI_TOKEN.ABI, provider.getSigner(address || 0))
    } catch (error) {
      console.error('Failed To Get Contract', error)

      return null
    }
  }, [address, provider, contractInfo, address, networkInfo, provider]) as T
}

export default useTokenContact
