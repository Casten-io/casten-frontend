import React, { useEffect, useState } from "react";
import "./view-base.scss";
import Header from "../Header";
import { Hidden, useMediaQuery } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { DRAWER_WIDTH, TRANSITION_DURATION } from "../../constants/style";
import Drawer from "../Drawer";
import { Paper, Box } from "@mui/material";
import { useDispatch } from 'react-redux';
import { useLocation } from "react-router-dom";
import MobileDrawer from "../Drawer/mobile-drawer";
import { makeStyles } from "@mui/styles";
import { backendUrl } from '../../constants';
import { updateAssetListExecution, updateTotalOriginatedLoans } from '../../store/slices/account';

interface IViewBaseProps {
  children: React.ReactNode;
}

function ViewBase({ children }: IViewBaseProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSmallerScreen = useMediaQuery("(max-width: 960px)");
  const location = useLocation();
  const dispatch = useDispatch();
  const executeQuery = () => {
    fetch(`${backendUrl}/dune/execute/1629073`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((resp) => resp.json())
      .then((respJson) => dispatch(updateAssetListExecution({
        assetListExecution: respJson.data.execution_id,
      })))
      .catch((error) => {
        console.error('query execution failed: ', error)
      });
  };
  const executeQueryTOL = () => {
    fetch(`${backendUrl}/dune/execute/1681617`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((resp) => resp.json())
      .then((respJson) => dispatch(updateTotalOriginatedLoans({
        totalOriginatedLoans: respJson.data.execution_id,
      })))
      .catch((error) => {
        console.error('query execution failed: ', error)
      });
  };
  useEffect(() => {
    executeQuery();
    executeQueryTOL();
    setInterval(() => {
      executeQuery();
      executeQueryTOL();
    }, 10 * 60 * 1000);
  }, [])
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
