import "./security.scss";
import { Typography } from "@mui/material";
import FactList from "../../components/FactList";
import OrderList from "../../components/OrderList";

function TokenOfferings() {
  return (
    <div className="security-view">
      <div className="header-container">
        <Typography className="title">QuickCheck</Typography>
        <Typography className="subtitle">Total Issuance - $200,000 and Maturity 270 days</Typography>
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
