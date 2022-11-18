import { useState, useEffect, useCallback } from "react";
import "./portfolio.scss";
import {
  Grid,
  InputAdornment,
  OutlinedInput,
  Backdrop,
  Slider,
  Fade,
  Box,
  Typography,
} from "@mui/material";
// import FactList from "../../components/FactList";
import PortfolioList from "../../components/PortfolioList";
import { ADDRESS_BY_NETWORK_ID, Address } from "../../constants/address";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { ethers } from "ethers";
import useTokenBalance from '../../hooks/useTokenBalance';
import { parseBalance } from '../../utils';
import { backendUrl } from '../../constants';

function Portfolio() {
  const networkInfo = useSelector(
    (state: RootState) => state.account.networkInfo
  );
  const provider = useSelector((state: RootState) => state.account.provider);
  const address = useSelector((state: RootState) => state.account.address);
  const contractInfo =
    ADDRESS_BY_NETWORK_ID[networkInfo?.chainId.toString() as Address | "80001"];
  let juniorTokenContract: ethers.Contract | null;
  let seniorTokenContract: ethers.Contract | null;
  const { data: tokenBalance } = useTokenBalance(address, contractInfo?.DAI_TOKEN?.address)

  const getBalancesFromContract = async (
    selfC: ethers.Contract,
    juniorOperatorC: ethers.Contract
  ) => {
    const juniorTokenBalance = await selfC.balanceOf(address);
    const seniorTokenBalance = await juniorOperatorC.balanceOf(address);
  };

  useEffect(() => {
    if (contractInfo) {
      juniorTokenContract = new ethers.Contract(
        contractInfo.JUNIOR_TOKEN.address,
        contractInfo.JUNIOR_TOKEN.ABI,
        provider?.getSigner()
      );
      seniorTokenContract = new ethers.Contract(
        contractInfo.SENIOR_TOKEN.address,
        contractInfo.SENIOR_TOKEN.ABI,
        provider?.getSigner()
      );
      getBalancesFromContract(juniorTokenContract, seniorTokenContract);
    }
  }, [contractInfo]);

  return (
    <div className="portfolio-view">
      <div className="header-container">
        <Typography className="title">Portfolio Manager</Typography>
      </div>
      <div className="content-container">
        <div className="balance-container">
          <Typography className="balance">Available Balance</Typography>
          <Typography className="usdc-balance">{parseBalance(tokenBalance || 0, 2, contractInfo?.DAI_TOKEN?.TOKEN_DECIMALS)} USDC</Typography>
        </div>
        <div className="portfoliolist-container">
          <PortfolioList />
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
