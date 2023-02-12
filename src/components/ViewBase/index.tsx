import React, { useCallback, useEffect, useState } from "react";
import "./view-base.scss";
import Header from "../Header";
import { BigNumber, Contract } from "ethers";
import { Hidden, LinearProgress, Modal, TextField, Typography, useMediaQuery } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { DRAWER_WIDTH, TRANSITION_DURATION } from "../../constants/style";
import Drawer from "../Drawer";
import { Paper, Box } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from "react-router-dom";
import MobileDrawer from "../Drawer/mobile-drawer";
import { makeStyles } from "@mui/styles";
import { backendUrl, securitizeDomainId, securitizeURL } from '../../constants';
import { updateAssetListExecution, updateTotalOriginatedLoans } from '../../store/slices/account';
import { RootState } from '../../store';
import { Address, ADDRESS_BY_NETWORK_ID } from '../../constants/address';
import Casten from '../../assets/icons/Casten.png';
import { parseBalance, scanTxLink } from '../../utils';
import ArrowNE from '../../assets/icons/Arrow-NorthEast.svg';

interface IViewBaseProps {
  children: React.ReactNode;
};

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

function ViewBase({ children }: IViewBaseProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [memberListChecking, setMemberListChecking] = useState(false);

  const isSmallerScreen = useMediaQuery("(max-width: 960px)");
  const location = useLocation();
  const dispatch = useDispatch();
  const networkInfo = useSelector(
    (state: RootState) => state.account.networkInfo,
  );
  const securitizeAT = useSelector((state: RootState) => state.account.securitizeAT)
  const provider = useSelector((state: RootState) => state.account.provider);
  const address = useSelector((state: RootState) => state.account.address);
  const contractInfo =
    ADDRESS_BY_NETWORK_ID[networkInfo?.chainId.toString() as Address | "137"];
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
        console.error('query execution failed: ', error);
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
        console.error('query execution failed: ', error);
      });
  };
  useEffect(() => {
    executeQuery();
    executeQueryTOL();
    setInterval(() => {
      executeQuery();
      executeQueryTOL();
    }, 10 * 60 * 1000);
  }, []);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const checkMemberInWhitelist = useCallback(async () => {
    if (!contractInfo || !networkInfo?.chainId || !address || !provider) {
      return;
    }
    const memberContract = new Contract(
      contractInfo.JUNIOR_MEMBER_LIST.address,
      contractInfo.JUNIOR_MEMBER_LIST.ABI,
      provider.getSigner(),
    );

    const isMember = await memberContract.hasMember(address);
    setIsMember(isMember);
    setMemberListChecking(false);
  }, [address, networkInfo, contractInfo, provider]);

  useEffect(() => {
    setMemberListChecking(true);
    checkMemberInWhitelist()
      .catch((error) => console.error('failed to check member in whitelist', error));
  }, [checkMemberInWhitelist]);

  return (
    <div className="view-base-root">
      <Header
        drawe={!isSmallerScreen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {!['/', '/securitize-authorize'].includes(location.pathname) && (
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
      <Modal
        open={Boolean(address && !memberListChecking && !isMember && !securitizeAT && location.pathname !== '/securitize-authorize')}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="invest-modal">
          <>
            <Box className="header-img">
              <img src={Casten} alt="Casten Logo" className="casten-logo" />
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" mb={2}>
              <Typography id="loader-text" variant="caption" component="span">
                Please complete the KYC process to enable investment.
              </Typography>
            </Box>
            <Box className="form-btns">
              {!securitizeAT && <a
                href={`${
                  securitizeURL
                }/#/authorize?issuerId=${
                  securitizeDomainId
                }&scope=info%20details%20verification&redirecturl=${window.location.origin}/securitize-authorize`}
              >
                Complete KYC
              </a>}
            </Box>
          </>
        </Box>
      </Modal>
      {/*<Modal*/}
      {/*  open={Boolean(address && !memberListChecking && !isMember && !securitizeAT && location.pathname !== '/securitize-authorize')}*/}
      {/*  aria-labelledby="modal-modal-title"*/}
      {/*  aria-describedby="modal-modal-description"*/}
      {/*>*/}
      {/*  <Box sx={style}>*/}
      {/*    <Typography id="modal-modal-title">*/}
      {/*      Please complete your KYC*/}
      {/*    </Typography>*/}
      {/*    <Box display="flex" justifyContent="space-between" mt={2}>*/}
      {/*      {!securitizeAT && <a href={`${*/}
      {/*        securitizeURL*/}
      {/*      }/#/authorize?issuerId=${*/}
      {/*        securitizeDomainId*/}
      {/*      }&scope=info%20details%20verification&redirecturl=${window.location.origin}/securitize-authorize`}*/}
      {/*          className="action-btn" type="button">*/}
      {/*        Complete KYC*/}
      {/*      </a>}*/}
      {/*    </Box>*/}
      {/*  </Box>*/}
      {/*</Modal>*/}
      {!['/', '/securitize-authorize'].includes(location.pathname) && <div className={"content"}>{children}</div>}
      {['/', '/securitize-authorize'].includes(location.pathname) && (
        <div className={`content-dash`}>{children}</div>
      )}
    </div>
  );
}

export default ViewBase;
