import { useState, useEffect } from "react";
import "./portfolio.scss";
import {
  Grid,
  InputAdornment,
  OutlinedInput,
  Backdrop,
  Zoom,
  Slider,
  Fade,
  Box,
  Typography,
} from "@material-ui/core";
// import FactList from "../../components/FactList";
import PortfolioList from "../../components/PortfolioList";

function Portfolio() {
  return (
    <div className="portfolio-view">
      <Zoom in={true}>
        <>
          <div className="header-container">
            <Typography className="title">Portfolio Manager</Typography>
          </div>
          <div className="content-container">
            <div className="balance-container">
              <Typography className="balance">Available Balance</Typography>
              <Typography className="usdc-balance">$ 1,000,000 USDC</Typography>
            </div>
            <div className="portfoliolist-container">
              <PortfolioList />
            </div>
          </div>
        </>
      </Zoom>
    </div>
  );
}

export default Portfolio;
