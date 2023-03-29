import { useMemo } from "react";
import "./portfolio.scss";
import {
  Typography,
} from "@mui/material";
// import FactList from "../../components/FactList";
import PortfolioList from "../../components/PortfolioList";
import { ADDRESS_BY_NETWORK_ID, Address } from "../../constants/address";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import useTokenBalance from '../../hooks/useTokenBalance';
import { parseBalance } from '../../utils';

function Portfolio() {
  const networkInfo = useSelector(
    (state: RootState) => state.account.networkInfo
  );
  const address = useSelector((state: RootState) => state.account.address);
  const chainId = networkInfo?.chainId || 137
  const contractInfo = useMemo(() => {
    return ADDRESS_BY_NETWORK_ID[chainId.toString() as Address]
  }, [chainId]);
  const { data: tokenBalance } = useTokenBalance(address, contractInfo?.DAI_TOKEN?.address)

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
