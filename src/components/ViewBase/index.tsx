import React, { useState } from "react";
import "./view-base.scss";
import Header from "../Header";
import { Hidden, makeStyles, useMediaQuery } from "@material-ui/core";
import { DRAWER_WIDTH, TRANSITION_DURATION } from "../../constants/style";
import MobileDrawer from "../Drawer/mobile-drawer";
import Drawer from "../Drawer";
import { Paper, Box } from "@material-ui/core";
import { useLocation } from "react-router-dom";

interface IViewBaseProps {
  children: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
    },
  },
  content: {
    padding: theme.spacing(1),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: TRANSITION_DURATION,
    }),
    height: "100%",
    overflow: "auto",
    marginLeft: DRAWER_WIDTH,
  },
  contentDash: {
    padding: theme.spacing(1),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: TRANSITION_DURATION,
    }),
    height: "100%",
    overflow: "auto",
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: TRANSITION_DURATION,
    }),
    marginLeft: 0,
  },
}));

function ViewBase({ children }: IViewBaseProps) {
  const classes = useStyles();

  const [mobileOpen, setMobileOpen] = useState(false);

  const isSmallerScreen = useMediaQuery("(max-width: 960px)");
  const location = useLocation();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="view-base-root">
      <Header
        drawe={!isSmallerScreen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {location.pathname !== "/" && (
        <div className={classes.drawer}>
          <Box component="div" sx={{ display: { xs: "block", sm: "none" } }}>
            <MobileDrawer
              mobileOpen={mobileOpen}
              handleDrawerToggle={handleDrawerToggle}
            />
          </Box>
          <Box component="div" sx={{ display: { xs: "none", sm: "block" } }}>
            <Drawer />
          </Box>{" "}
        </div>
      )}

      {location.pathname !== "/" && (
        <div
          className={`${classes.content} ${
            isSmallerScreen && classes.contentShift
          }`}
        >
          {children}
        </div>
      )}
      {location.pathname === "/" && (
        <div className={`${classes.contentDash} `}>{children}</div>
      )}
    </div>
  );
}

export default ViewBase;
