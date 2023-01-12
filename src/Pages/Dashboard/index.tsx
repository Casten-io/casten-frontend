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
import { backendUrl } from '../../constants';
import { RootState } from '../../store';

function Dashboard() {
  const dispatch = useDispatch();
  //   const { provider, address, connect, chainID, checkWrongNetwork } =
  //     useWeb3Context();

  const tolExecutionId = useSelector((state: RootState) => state.account.totalOriginatedLoans);
  const [tol, setTOL] = useState(0);

  const fetchUserOrders = useCallback(async () => {
    if (!tolExecutionId) {
      return;
    }
    const resp = await fetch(`${backendUrl}/dune/execute-and-serve/1681617/${tolExecutionId}`, {
      method: 'POST',
    });
    const respJson = await resp.json();
    setTOL(respJson.data.rows[0].total_loans_usd);
  }, [tolExecutionId]);

  useEffect(() => {
    fetchUserOrders()
      .catch((error) => console.error('error while fetching user\'s orders: ', error));
  }, [tolExecutionId]);

  const card = (text: string, value: number = 10000.00, sym: string = '$') => (
    <CardContent>
      <Typography style={{ color: "#4B584D", fontFamily: "OpenSans" }}>{text}</Typography>
      <Typography variant="h5" component="div">
        {sym}{Number(value.toFixed(2)).toLocaleString()}
      </Typography>
    </CardContent>
  );

  return (
    <div className="dashboard-view">
      <div className="numbers">
        <div className="dashboard-header">
          <Typography className="title">Pools</Typography>
        </div>
        <div className="protocol-stats">
          <Box className="stat-box">
            <Card variant="outlined">{card("Total Value Locked")}</Card>
          </Box>
          <Box className="stat-box">
            <Card variant="outlined">{card("Loan Originated", tol, '$')}</Card>
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
