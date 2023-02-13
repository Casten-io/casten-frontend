import React, { useEffect, useState } from 'react'

import { Box, CircularProgress, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { backendUrl, securitizeDomainId, securitizeURL } from '../../constants';
import { updateKYCStatus, updateSercuritizeDetails } from '../../store/slices/account';
import { RootState } from '../../store';

const SecuritizeAuthorize = () => {
  const [query] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wallet = useSelector((state: RootState) => state.account.address);
  const securitizeAT = useSelector((state: RootState) => state.account.securitizeAT);
  const kycStatus = useSelector((state: RootState) => state.account.kycStatus);
  const [checking, setChecking] = useState<boolean>(true)
  const [error, setError] = useState<any | null>()

  const authorizeCode = () => {
    fetch(`${backendUrl}/auth/authenticate-securitize`, {
      method: 'POST',
      body: JSON.stringify({
        code: query.get('code'),
        wallet,
      }),
      headers: {
        accept: 'application/json',
        'Content-type': 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((respJson: any) => {
        if (respJson.statusCode === 409) {
          setChecking(false);
          setError(respJson);
          return;
        }
        dispatch(updateSercuritizeDetails(respJson.data));
        fetchKycStatus();
        // navigate('/')
      })
      .catch((error) => {
        console.error('failed to authenticate code: ', error);
      });
  }

  const fetchKycStatus = () => {
    fetch(`${backendUrl}/investor/kyc-status/${wallet}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-type': 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((respJson: any) => {
        dispatch(updateKYCStatus(respJson.data));
        setChecking(false);
        if (['verified', 'manual-review', 'processing'].includes(respJson.data.kycStatus)) {
          return navigate('/');
        }
      })
      .catch((error) => {
        console.error('failed to authenticate code: ', error);
      });
  }

  useEffect(() => {
    console.log('code: ', query.get('code'))
    if (!query.get('code') && !query.get('kycDocUploaded')) {
      return navigate('/');
    }
    if (wallet) {
      if (query.get('code') && !securitizeAT) {
        authorizeCode();
        return;
      }
      if (query.get('kycDocUploaded')) {
        fetchKycStatus();
      }
    }
  }, [wallet]);

  return <>
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!securitizeAT && checking && <CircularProgress sx={{ width: 200, height: 200 }}/>}

      {securitizeAT && !checking && <Box
        sx={{
          maxWidth: '500px',
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {kycStatus && ['updates-required', 'rejected', 'expired'].includes(kycStatus) && <p>
          KYC {kycStatus === 'updates-required' ? 'requires a update' : `is ${kycStatus}`}
        </p>}
        <a
          href={`${securitizeURL}/#/profile/verification/type?issuerId=${securitizeDomainId}&scope=info%20details%20verification&redirecturl=${window.location.origin}/securitize-kyc-doc-uploaded`}
          className="action-btn"
        >
          Upload your KYC Documents{kycStatus && ['updates-required', 'rejected', 'expired'].includes(kycStatus) && ' again'}
        </a>
      </Box>}
      {error?.statusCode === 409 && !checking && <Box
        sx={{
          maxWidth: '500px',
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography id="loader-text" variant="caption" component="span" sx={{ marginBottom: '10px' }}>
          Securitize Account already connected with another wallet. Sign out of existing account and Sign In with different account.
        </Typography>
        {kycStatus && ['updates-required', 'rejected', 'expired'].includes(kycStatus) && <p>
          KYC {kycStatus === 'updates-required' ? 'requires a update' : `is ${kycStatus}`}
        </p>}
        <a
          href={`${securitizeURL}/#/authorize?issuerId=${securitizeDomainId}&scope=info%20details%20verification&redirecturl=${window.location.origin}/securitize-authorize`}
          className="action-btn"
        >
          Reconnect Securitize Account
        </a>
      </Box>}
    </Box>
  </>;
};

export default SecuritizeAuthorize;
