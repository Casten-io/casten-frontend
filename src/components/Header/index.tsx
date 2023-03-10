import React, { useState } from "react";
import { DRAWER_WIDTH, TRANSITION_DURATION } from "../../constants/style";
import MenuIcon from "../../assets/icons/hamburger.svg";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import WalletConnect from "../Commons/WalletConnect";
import Casten from "../../assets/icons/Casten.png";
import "./header.scss";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { makeStyles } from "@mui/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { securitizeDomainId, securitizeURL } from '../../constants';

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
  const address: string = useSelector((state: RootState) => state.account.address);
  // const provider = useSelector((state: RootState) => state.account.provider);
  const kycStatus = useSelector((state: RootState) => state.account.kycStatus);
  const networkInfo = useSelector((state: RootState) => state.account.networkInfo);

  const navigate = useNavigate();
  const location = useLocation();

  const handlePortfolioClick = () => {
    navigate("/portfolio");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    // <div className={`${classes.topBar} ${!drawe && classes.topBarShift}`}>
    <AppBar className="appbar" style={{ background: "#fff", height: "70px" }}>
      <Toolbar disableGutters className="dapp-topbar">
        <div onClick={handleLogoClick} style={{ cursor: "pointer" }} className="header-logo">
          <img src={Casten} alt="Casten Logo" className="casten-logo" />
        </div>
        <div className="dapp-items">
          {!['/securitize-authorize', '/securitize-kyc-doc-uploaded'].includes(location.pathname) && address && networkInfo && [137, 80001].includes(networkInfo.chainId) && (
            <div className="portfolio-container">
              <div className="portfolio-button" onClick={handlePortfolioClick}>
                Portfolio Manager
              </div>
            </div>
          )}
          {/*{address && <div className="portfolio-container">*/}
          {/*  <div className="portfolio-button" onClick={() => {*/}
          {/*    provider?.getSigner()?.signMessage('checking')*/}
          {/*  }}>*/}
          {/*    Sign Check*/}
          {/*  </div>*/}
          {/*</div>}*/}
          <WalletConnect />
        </div>
      </Toolbar>
      {location.pathname !== '/securitize-authorize' && kycStatus && ['processing', 'manual-review', 'none', 'updates-required', 'rejected', 'expired'].includes(kycStatus) && <Box sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        p: '8px 10px',
        color: kycStatus === 'rejected' || ['none', 'updates-required', 'expired'].includes(kycStatus) ? '#361F23' : '#FFF',
        backgroundColor: kycStatus === 'rejected' ?
          '#FFCCCA' : ['none', 'updates-required', 'expired'].includes(kycStatus) ?
            '#FFE4D8' : '#C3DDFF',
      }}>
        {['none', 'updates-required', 'expired'].includes(kycStatus) && <a
          href={`${securitizeURL}/#/profile/verification/type?issuerId=${securitizeDomainId}&scope=info%20details%20verification&redirecturl=${window.location.origin}/securitize-kyc-doc-uploaded`}
        >
          Upload your KYC Documents{kycStatus && ['manual-review', 'updates-required', 'rejected', 'expired'].includes(kycStatus) && ' again'}
        </a>}
        {['processing', 'manual-review'].includes(kycStatus) && <span>KYC verification is in <b>Progress</b></span>}
        {kycStatus === 'rejected' && <>
          Sorry! You are not approved to deposit at this time, please try again later.&nbsp;
          If you think this is a mistake, please reach us on&nbsp;
          <a
            href="https://discord.gg/gRUMG7R7"
            target="_blank"
            rel="noreferrer noopener"
          >
            discord
          </a>
        </>}
      </Box>}
    </AppBar>
  );
}

export default Header;
