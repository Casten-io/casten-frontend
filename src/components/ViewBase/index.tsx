import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  toggleKycModal,
  updateKYCStatus,
  updateWhitelistStatus,
} from '../../store/slices/account';
import { RootState } from '../../store';
import { Address, ADDRESS_BY_NETWORK_ID } from '../../constants/address';
import Casten from '../../assets/icons/Casten.png';
import KYCDoc from '../../assets/doc/KYC-procedures.pdf';
import SecuritizeLogo from '../../assets/images/securitize-logo.svg';
import Close from '../../assets/icons/close.svg';
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
  const [memberListChecking, setMemberListChecking] = useState(false);
  const [kycVerifiedMessage, setKycVerifiedMessage] = useState(false);

  const isSmallerScreen = useMediaQuery("(max-width: 960px)");
  const location = useLocation();
  const dispatch = useDispatch();
  const networkInfo = useSelector(
    (state: RootState) => state.account.networkInfo,
  );
  let kycCheckInterval: any | null = null;
  const securitizeAT = useSelector((state: RootState) => state.account.securitizeAT);
  const showKycModal = useSelector((state: RootState) => state.account.showKycModal);
  const kycStatus = useSelector((state: RootState) => state.account.kycStatus) || '';
  const isMember = useSelector((state: RootState) => state.account.whitelistStatus);
  const provider = useSelector((state: RootState) => state.account.provider);
  const address = useSelector((state: RootState) => state.account.address);
  const chainId = networkInfo?.chainId || 137
  const contractInfo = useMemo(() => {
    return ADDRESS_BY_NETWORK_ID[chainId.toString() as Address]
  }, [chainId]);

  const fetchKycStatus = () => {
    fetch(`${backendUrl}/investor/kyc-status/${address}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-type': 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((respJson: any) => {
        dispatch(updateKYCStatus(respJson.data));
        if (
          respJson.data.kycStatus === 'verified' &&
          ['manual-review', 'processing', 'none', 'updates-required', 'expired'].includes(kycStatus)
        ) {
          setKycVerifiedMessage(true)
          clearInterval(kycCheckInterval)
        }
      })
      .catch((error) => {
        console.error('failed to authenticate code: ', error);
      });
  }

  useEffect(() => {
    if (address && !['/securitize-authorize', '/securitize-kyc-doc-uploaded'].includes(location.pathname)) {
      if (['processing', 'none', 'updates-required', 'rejected', 'expired'].includes(kycStatus)) {
        fetchKycStatus()
        kycCheckInterval = setInterval(() => fetchKycStatus(), 2 * 60 * 1000);
      }
    }
    return () => {
      if (kycCheckInterval) {
        clearInterval(kycCheckInterval);
      }
    }
  }, [kycStatus, location])

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

    let isMember = await memberContract.hasMember(address);
    if (networkInfo?.chainId === 80001) {
      const memberContract = new Contract(
        contractInfo.SENIOR_MEMBER_LIST.address,
        contractInfo.SENIOR_MEMBER_LIST.ABI,
        provider.getSigner(),
      );

      const isSeniorMember = await memberContract.hasMember(address);
      isMember = isMember && isSeniorMember;
    }
    dispatch(updateWhitelistStatus(isMember))
    setMemberListChecking(false);
  }, [contractInfo, networkInfo?.chainId, address, provider, dispatch]);

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

      {![
        '/',
        '/securitize-authorize',
        '/securitize-kyc-doc-uploaded',
      ].includes(location.pathname) && (
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
        open={kycVerifiedMessage}
        onClose={() => setKycVerifiedMessage(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="invest-modal">
          <img src={Close} alt="close" className="close" onClick={() => dispatch(toggleKycModal())} />
          <Box className="header-img">
            <img src={Casten} alt="Casten Logo" className="casten-logo" />
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" mb={2}>
            <Typography id="loader-text" variant="caption" component="span">
              Congratulations Your KYC Documents are verified!!
            </Typography>
          </Box>
          <Box className="form-btns">
            <button onClick={() => setKycVerifiedMessage(false)}>Close</button>
          </Box>
          <Box className="modal-footer">
            <Typography id="power-by-text" variant="caption" component="span">
              powered by
            </Typography>
            <a href="https://securitize.io/securitize-id" target="_blank" rel="noreferrer noopener">
              <img src={SecuritizeLogo} className="logo" alt="securitize-logo"/>
            </a>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={Boolean(
          address &&
          (
            ['processing', 'manual-review', 'none', 'updates-required', 'rejected', 'expired'].includes(kycStatus) ||
            (!isMember && !securitizeAT)
          ) &&
          showKycModal
        )}
        onClose={() => dispatch(toggleKycModal())}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="invest-modal">
          <img src={Close} alt="close" className="close" onClick={() => dispatch(toggleKycModal())} />
          <Box className="header-img">
            <img src={Casten} alt="Casten Logo" className="casten-logo" />
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" mb={2}>
            {!securitizeAT || ['none', 'updates-required', 'expired'].includes(kycStatus) ?
              <Typography id="loader-text" variant="caption" component="span">
                It appears you have not been approved to deposit on this Casten pool. To get approved,&nbsp;
                you need to Submit you <a href={KYCDoc} target="_blank" rel="noopener noreferrer">KYC Documents</a>.
                Once the information you provide is validated, you will be approved to deposit.
              </Typography>
              :
              kycStatus === 'rejected' ?
                <Typography id="loader-text" variant="caption" component="span">
                  Sorry! You are not approved to deposit at this time, please try again later.&nbsp;
                  If you think this is a mistake, please reach us on&nbsp;
                  <a
                    href="https://discord.gg/gRUMG7R7"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    discord
                  </a>
                </Typography>
                :
                ['processing', 'manual-review'].includes(kycStatus) && <Box sx={{ display: 'block' }}>
                  <Typography id="processing-title" variant="subtitle1" sx={{ textAlign: 'center', mb: 3 }}>KYC verification is in <b>Progress</b></Typography>
                  <Typography id="loader-text" variant="caption" component="span">
                    There were some issues with your application. One of our agents is reviewing it personally so the
                    verification process may take longer than usual. We will contact you as soon as it is done so you
                    can proceed to the investor dashboard
                  </Typography>
                </Box>
            }
          </Box>
          <Box className="form-btns">
            {(!securitizeAT || ['none', 'updates-required', 'expired'].includes(kycStatus)) && <a
              href={
                ['none', 'updates-required', 'expired'].includes(kycStatus) ?
                  `${securitizeURL}/#/profile/verification/type?issuerId=${securitizeDomainId}&scope=info%20details%20verification&redirecturl=${window.location.origin}/securitize-kyc-doc-uploaded`
                  :
                  `${securitizeURL}/#/authorize?issuerId=${securitizeDomainId}&scope=info%20details%20verification&redirecturl=${window.location.origin}/securitize-authorize`
              }
            >
              {['none', 'updates-required', 'expired'].includes(kycStatus) ? 'Upload KYC Documents' : 'Connect Securitize iD'}
            </a>}
          </Box>
          <Box className="modal-footer">
            <Typography id="power-by-text" variant="caption" component="span">
              powered by
            </Typography>
            <a href="https://securitize.io/securitize-id" target="_blank" rel="noreferrer noopener">
              <img src={SecuritizeLogo} className="logo" alt="securitize-logo"/>
            </a>
          </Box>
        </Box>
      </Modal>
      {!['/', '/securitize-authorize', '/securitize-kyc-doc-uploaded'].includes(location.pathname) && <div className={"content"}>{children}</div>}
      {['/', '/securitize-authorize', '/securitize-kyc-doc-uploaded'].includes(location.pathname) && (
        <div className={`content-dash`}>{children}</div>
      )}
    </div>
  );
}

export default ViewBase;
