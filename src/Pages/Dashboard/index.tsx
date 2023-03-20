import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Decimal from "decimal.js";
import {
  Grid,
  InputAdornment,
  OutlinedInput,
  Box,
  Typography,
  Button,
  CardActions,
  CardContent,
  Card,
} from "@mui/material";

import "./dashboard.scss";
// import { useWeb3Context } from "../../hooks";

import { Skeleton } from "@material-ui/lab";
import classnames from "classnames";
import ProductList from "../../components/ProductList";
import { backendUrl, subgraphUrl } from '../../constants';
import { RootState } from '../../store';
import { createClient } from 'urql';

function Dashboard() {
  const dispatch = useDispatch();
  //   const { provider, address, connect, chainID, checkWrongNetwork } =
  //     useWeb3Context();

  const tolExecutionId = useSelector((state: RootState) => state.account.totalOriginatedLoans);
  const [tol, setTOL] = useState(0);
  const [tvl, setTVL] = useState(0);

  const fetchTOL = async () => {
    // if (!tolExecutionId) {
    //   return;
    // }
    const client = createClient({
      url: subgraphUrl,
    });
    const resp = await client.query(
      `query {
          stats {
            id
            TVL
            TotalLoansOriginated
          }
        }`,
      {},
    ).toPromise();
    let tol = 0;
    let tvl = 0;
    resp.data.stats.forEach((v: any) => {
      tol += Number(v.TotalLoansOriginated);
      tvl += Number(v.TVL);
    });
    setTOL(tol);
    setTVL(tvl);
  };

  useEffect(() => {
    fetchTOL()
      .catch((error) => console.error('error while fetching tol: ', error));
  }, []);

  const card = (text: string, value: number = 10000.00, sym: string = '$') => (
    <CardContent>
      <Typography style={{ color: "#4B584D", fontFamily: "OpenSans" }}>{text}</Typography>
      <Typography variant="h5" component="div">
        {Number(value.toFixed(2)).toLocaleString()} {sym}
      </Typography>
    </CardContent>
  );

  return (
    <div className="dashboard-view">
      <div className="numbers">
        <div className="dashboard-header">
          <Typography className="title">Active Deals</Typography>
        </div>
        <div className="protocol-stats">
          <Box className="stat-box">
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                boxShadow: '0px 2px 10px 2px rgb(29 41 57 / 10%), 0px 1px 3px rgb(29 41 57 / 6%) !important',
              }}
            >
              {card("Total Value Locked", Number(tvl) / (10 ** 6), 'USDC')}
            </Card>
          </Box>
          <Box className="stat-box">
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                boxShadow: '0px 2px 10px 2px rgb(29 41 57 / 10%), 0px 1px 3px rgb(29 41 57 / 6%) !important',
              }}
            >
              {card("Loans Originated", tol, 'USDC')}
            </Card>
          </Box>
        </div>
        {/* <div className="personal-stats">
          <Box className="stat-box">
            <Card variant="outlined">{card("Portfolio Balance")}</Card>
          </Box>
          <Box className="stat-box">
            <Card variant="outlined" className="card">
              {card("USDC Locked")}
            </Card>
          </Box>
        </div> */}
      </div>

      <ProductList />
    </div>
  );
}

export default Dashboard;
