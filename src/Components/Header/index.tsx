import { useState } from "react";
import { DRAWER_WIDTH, TRANSITION_DURATION } from "../../constants/style";
import MenuIcon from "../../assets/icons/hamburger.svg";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AppBar, Toolbar, Typography } from "@mui/material";
import WalletConnect from "../Commons/WalletConnect";
import Casten from "../../assets/icons/Casten.png";
import "./header.scss";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";

interface IHeader {
  handleDrawerToggle: () => void;
  drawe: boolean;
}

// const useStyles = makeStyles((theme: Theme) => ({
//   appBar: {
//     [theme.breakpoints.up("sm")]: {
//       width: "100%",
//     },
//     justifyContent: "space-between",
//     alignItems: "space-between",
//     background: "transparent",
//     backdropFilter: "none",
//     zIndex: 10,
//   },
//   topBar: {
//     transition: theme.transitions.create("margin", {
//       easing: theme.transitions.easing.sharp,
//       duration: TRANSITION_DURATION,
//     }),
//   },
//   topBarShift: {
//     transition: theme.transitions.create("margin", {
//       easing: theme.transitions.easing.easeOut,
//       duration: TRANSITION_DURATION,
//     }),
//     marginLeft: 0,
//   },
// }));
function Header({ handleDrawerToggle, drawe }: IHeader) {
  // const classes = useStyles();
  const isVerySmallScreen = useMediaQuery("(max-width: 400px)");
  const isWrapShow = useMediaQuery("(max-width: 480px)");
  const address: string = useSelector(
    (state: RootState) => state.account.address
  );

  const navigate = useNavigate();

  const handlePortfolioClick = () => {
    navigate("/portfolio");
  };

  return (
    // <div className={`${classes.topBar} ${!drawe && classes.topBarShift}`}>
    <AppBar className="appbar" style={{ background: "#fff", height: "70px" }}>
      <Toolbar disableGutters className="dapp-topbar">
        <div>
          <img src={Casten} alt="Casten Logo" className="casten-logo" />
        </div>
        <div className="dapp-items">
          {address && (
            <div className="portfolio-container">
              <div className="portfolio-button" onClick={handlePortfolioClick}>
                Portfolio Manager
              </div>
            </div>
          )}
          <WalletConnect />
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
