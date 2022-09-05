import React, { useState } from "react";
import "./view-base.scss";
import Header from "../Header";
import { Hidden, useMediaQuery } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { DRAWER_WIDTH, TRANSITION_DURATION } from "../../constants/style";
import MobileDrawer from "../Drawer/mobile-drawer";
import Drawer from "../Drawer";
import { Paper, Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { makeStyles } from "@mui/styles";

interface IViewBaseProps {
  children: React.ReactNode;
}

function ViewBase({ children }: IViewBaseProps) {
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
        <div className="drawer">
          <Box
            sx={{ display: { xs: "block", sm: "none" }, zIndex: 0 }}
            className="sidebar"
          >
            <MobileDrawer
              mobileOpen={mobileOpen}
              handleDrawerToggle={handleDrawerToggle}
            />
          </Box>
          <Box
            sx={{ display: { xs: "none", sm: "block" }, zIndex: 0 }}
            className="sidebar"
          >
            <Drawer />
          </Box>{" "}
        </div>
      )}

      {location.pathname !== "/" && <div className={"content"}>{children}</div>}
      {location.pathname === "/" && (
        <div className={`content-dash`}>{children}</div>
      )}
    </div>
  );
}

export default ViewBase;
