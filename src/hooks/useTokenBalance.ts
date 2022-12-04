import useSWR from "swr";

import type { DaiToken } from "../abis/types";
import useTokenContract from "./useTokenContract";

const getTokenBalance = (contract: DaiToken) => (_: string, address: string) => contract.balanceOf(address);

const useTokenBalance = (address: string, tokenAddress: string, suspense = false) => {
  const contract = useTokenContract(tokenAddress);

  const shouldFetch = !!address && !!tokenAddress && !!contract;

  return useSWR(shouldFetch ? ["TokenBalance", address, tokenAddress] : null, getTokenBalance(contract as DaiToken), {
    suspense,
  });
};

export default useTokenBalance;
