import React, { useEffect } from 'react'

import { Box, CircularProgress } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { backendUrl, securitizeDomainId, securitizeURL } from '../../constants';
import { updateSercuritizeDetails } from '../../store/slices/account';
import { RootState } from '../../store';

const SecuritizeAuthorize = () => {
  const [query] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wallet = useSelector((state: RootState) => state.account.address)
  const securitizeAT = useSelector((state: RootState) => state.account.securitizeAT)

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
        dispatch(updateSercuritizeDetails(respJson.data))
        // navigate('/')
      })
      .catch((error) => {
        console.error('failed to authenticate code: ', error)
      });
  }

  useEffect(() => {
    console.log('code: ', query.get('code'))
    if (!query.get('code')) {
      return navigate('/');
    }
    if (wallet) {
      authorizeCode()
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
      {!securitizeAT && <CircularProgress sx={{ width: 200, height: 200 }}/>}
      {securitizeAT && <a
        href={`${securitizeURL}/#/profile/verification/type?issuerId=${securitizeDomainId}&scope=info%20details%20verification&redirecturl=${window.location.origin}/securitize-authorize?kyc-doc-upload=1`}
        className="action-btn"
      >
        Upload KYC Documents
      </a>}
    </Box>
  </>;
};

export default SecuritizeAuthorize;
