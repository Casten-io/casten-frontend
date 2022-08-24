import { useState } from "react";
import { DRAWER_WIDTH, TRANSITION_DURATION } from "../../constants/style";
import { makeStyles } from "@material-ui/core/styles";
import MenuIcon from "../../assets/icons/hamburger.svg";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import WalletConnect from "../Commons/WalletConnect";
import Casten from "../../assets/icons/Casten.png";

interface IHeader {
  handleDrawerToggle: () => void;
  drawe: boolean;
}

const useStyles = makeStyles((theme) => ({
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: "100%",
    },
    justifyContent: "flex-end",
    alignItems: "flex-end",
    background: "transparent",
    backdropFilter: "none",
    zIndex: 10,
  },
  topBar: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: TRANSITION_DURATION,
    }),
  },
  topBarShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: TRANSITION_DURATION,
    }),
    marginLeft: 0,
  },
}));
function Header({ handleDrawerToggle, drawe }: IHeader) {
  const classes = useStyles();
  const isVerySmallScreen = useMediaQuery("(max-width: 400px)");
  const isWrapShow = useMediaQuery("(max-width: 480px)");

  return (
    <div className={`${classes.topBar} ${!drawe && classes.topBarShift}`}>
      <AppBar position="sticky" className={classes.appBar} elevation={0}>
        <Toolbar disableGutters className="dapp-topbar">
          <div onClick={handleDrawerToggle} className="dapp-topbar-slider-btn">
            <img src={MenuIcon} />
          </div>
          <img src={Casten} alt="Casten Logo" className="casten-logo" />
          <div className="dapp-topbar-btns-wrap">
            <WalletConnect />
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Header;
