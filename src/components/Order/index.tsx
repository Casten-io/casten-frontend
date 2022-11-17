import "./order.scss";
import {
  Card,
  CardActions,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";
import { maxWidth } from "@mui/system";
function Order() {
  return (
    <div className="main-container">
      <Card
        sx={{ minWidth: "300px", maxWidth: "900px" }}
        className="order-container"
      >
        <CardContent className="order-content">
          <div className="header">
            <Typography className="status">Status</Typography>
            <Typography className="status-type">ongoing</Typography>
          </div>
          <Grid container className="content">
            <Grid item xs={5} className="item">
              <div className="unit">
                <Typography>Available for financing</Typography>
                <Typography>0.00 DAI</Typography>
              </div>
              <div className="unit">
                <Typography>Outstanding</Typography>
                <Typography>2,713,654.34 DAI</Typography>
              </div>
              <div className="unit">
                <Typography>Maturity Date</Typography>
                <Typography>Dec 28, 2024</Typography>
              </div>
              <div className="unit">
                <Typography>Financed By</Typography>
                <Typography>0x435838979209..</Typography>
              </div>
            </Grid>
            <Grid item xs={5} className="item">
              <div className="unit">
                <Typography>Financing Fee</Typography>
                <Typography>11.33%</Typography>
              </div>
              <div className="unit">
                <Typography>Total Financed</Typography>
                <Typography>3,500,000</Typography>
              </div>
              <div className="unit">
                <Typography>Total repaid</Typography>
                <Typography>0.00 DAI</Typography>
              </div>
              <div className="unit">
                <Typography>Financing Fee</Typography>
                <Typography>11.33%</Typography>
              </div>
            </Grid>

            {/* <Grid className="item">
            <Typography>Financing fee</Typography>
            <Typography>0.00 DAI</Typography>
          </Grid> */}
          </Grid>
        </CardContent>
      </Card>
      <Card
        sx={{ minWidth: "300px", maxWidth: "900px", marginTop: "30px" }}
        className="order-container"
      >
        <CardContent className="order-content">
          <div className="header">
            <Typography className="status">Risk</Typography>
          </div>
          <Grid container className="content">
            <Grid item xs={5} className="item">
              <div className="unit">
                <Typography>Risk group</Typography>
                <Typography>6</Typography>
              </div>
              <div className="unit">
                <Typography>Applied write-off</Typography>
                <Typography>0%</Typography>
              </div>
            </Grid>
            <Grid item xs={5} className="item">
              <div className="unit">
                <Typography>Applied risk adjustment</Typography>
                <Typography>0.33%</Typography>
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
}

export default Order;
