import { useState, useEffect } from "react";
import "./security.scss";
import {
  Grid,
  InputAdornment,
  OutlinedInput,
  Backdrop,
  Zoom,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@material-ui/core";
import FactList from "../../Components/FactList";
import AssetList from "../../Components/AssetList";

function Security() {
  const [action, setAction] = useState("Buy");

  const handleChange = (event: React.FormEvent<EventTarget>): void => {
    let target = event.target as HTMLInputElement;
    setAction(target.value);
  };

  return (
    <div className="security-view">
      <Zoom in={true}>
        <>
          <div className="header-container">
            <Typography className="title">Security Details</Typography>
            <Typography className="subtitle">Series A1</Typography>
          </div>
          <div className="content-container">
            <div className="content-header">
              <div className="action">
                <Typography className="order-type">Order Type</Typography>
                <FormControl className="form">
                  <Select
                    labelId="order"
                    id="demo-simple-select"
                    value={action}
                    className="select"
                    onChange={handleChange}
                  >
                    <MenuItem value={"Buy"} className="menu">
                      Buy
                    </MenuItem>
                    <MenuItem value={"Sell"} className="menu">
                      Sell
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="action-amount">
                <Typography className="amount">Enter Amount</Typography>
                <TextField id="outlined-basic" label="$" variant="outlined" />
              </div>
              <div className="balance">
                <Typography className="amount">Available Balance: </Typography>
                <Typography className="amount">$1,000,000 </Typography>
              </div>
            </div>
            <div className="factsheet-container">
              <Typography className="factsheet">Factsheet</Typography>
              <FactList />
            </div>
            <div className="assetlist-container">
              <Typography className="assetlist">Asset List</Typography>
              <AssetList />
            </div>
          </div>
        </>
      </Zoom>
    </div>
  );
}

export default Security;
