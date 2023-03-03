import { useState, useEffect } from "react";
import "./security.scss";
import {
  Grid,
  InputAdornment,
  OutlinedInput,
  Backdrop,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import FactList from "../../components/FactList";
import OrderList from "../../components/OrderList";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Address, ADDRESS_BY_NETWORK_ID } from "../../constants/address";

function TokenOfferings() {
  const networkInfo = useSelector(
    (state: RootState) => state.account.networkInfo
  );
  const provider = useSelector((state: RootState) => state.account.provider);

  const [action, setAction] = useState("Buy");

  const contractInfo =
    ADDRESS_BY_NETWORK_ID[networkInfo?.chainId.toString() as Address | "80001"];

  const handleChange = (event: any) => {
    // let target = event.target as HTMLInputElement;
    setAction(event.target.value);
  };

  return (
    <div className="security-view">
      <div className="header-container">
        <Typography className="title">QuickCheck</Typography>
        <Typography className="subtitle">Pool 2 - March 23</Typography>
      </div>
      <div className="content-container">
        <div className="content-header">
          <div className="action-container">
              {/*`<div className="action">*/}
              {/*  <Typography className="order-type">Order Type</Typography>*/}
              {/*  <FormControl className="form">*/}
              {/*    <Select*/}
              {/*      labelId="order"*/}
              {/*      id="demo-simple-select"*/}
              {/*      value={action}*/}
              {/*      className="select"*/}
              {/*      onChange={handleChange}*/}
              {/*    >*/}
              {/*      <MenuItem value={"Buy"} className="menu">*/}
              {/*        Buy*/}
              {/*      </MenuItem>*/}
              {/*      <MenuItem value={"Sell"} className="menu">*/}
              {/*        Sell*/}
              {/*      </MenuItem>*/}
              {/*    </Select>*/}
              {/*  </FormControl>*/}
              {/*</div>`*/}
          </div>
          {/*<div className="balance-container">*/}
          {/*  <div className="balance">*/}
          {/*    <Typography className="amount">Available Balance: </Typography>*/}
          {/*    <Typography className="amount">$1,000,000 </Typography>*/}
          {/*  </div>*/}
          {/*</div>*/}
        </div>
        <div className="factsheet-container">
          <Typography className="factsheet">Factsheet</Typography>
          <FactList />
        </div>
        <div className="assetlist-container">
          <Typography className="assetlist">Asset List</Typography>
          <OrderList />
        </div>
      </div>
    </div>
  );
}

export default TokenOfferings;
