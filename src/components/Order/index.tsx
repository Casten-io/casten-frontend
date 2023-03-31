import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BigNumber, ethers } from 'ethers';
import {
  Card,
  CardContent,
  Typography,
  Grid, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, TableContainer,
} from "@mui/material";

import "./order.scss";
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Address, ADDRESS_BY_NETWORK_ID } from '../../constants/address';
import { Pile } from '../../abis/types';
import { createClient } from 'urql';
import { subgraphUrl } from '../../constants';
import { CircularProgress } from '@material-ui/core';
import { useWallet } from '../../contexts/WalletContext';

function Order() {
  const params = useParams()
  const { provider } = useWallet()
  const networkInfo = useSelector((state: RootState) => state.account.networkInfo);
  const [outstandingAmount, setOutstandingAmount] = useState<number>(0);
  const [apiCallStatus, setApiCallStatus] = useState<boolean>(false);
  const [assetDetails, setAssetDetails] = useState<any>({});
  const [repays, setRepays] = useState<any[]>([]);

  const chainId = networkInfo?.chainId || 137
  const contractInfo = useMemo(() => {
    return ADDRESS_BY_NETWORK_ID[chainId.toString() as Address]
  }, [chainId]);

  const fetchRepayments = async () => {
    setApiCallStatus(true);
    const client = createClient({
      url: subgraphUrl,
    });

    // description -> financing fee
    // remove name
    //
    const resp = await client.query(
      `query Repays($id: String!) {
          repays(where: { loan: $id }) {
            id
            loan
            borrower
            currencyAmount
            blockNumber
            blockTimestamp
          }
        }`,
      { id: params.id },
    ).toPromise();
    setApiCallStatus(false);
    setRepays(resp.data.repays);
  }

  const fetchAsset = async () => {
    const client = createClient({
      url: subgraphUrl,
    });

    // description -> financing fee
    // remove name
    //
    const resp = await client.query(
      `query Loan($id: String!) {
          loan(id: $id) {
            id
            borrower
            nftId
            nftRegistry
            dateIssued
            maturityDate
            principal
            repaidAmount
            status
          }
        }`,
      { id: params.id },
    ).toPromise();
    setAssetDetails(resp.data.loan);
  };

  const fetchOutstandingAmount = useCallback(() => {
    if (!params.id) {
      return
    }
    if (contractInfo?.PILE?.address) {
      const contract = new ethers.Contract(
        contractInfo.PILE.address,
        contractInfo.PILE.ABI,
        provider,
      ) as Pile
      contract.debt(BigNumber.from(params.id).toString())
        .then((data) => {
          setOutstandingAmount(Number(BigInt(data.toString()) / BigInt(10 ** 6)));
        })
        .catch((error) => {
          console.error('error while fetching outstanding amount: ', error)
        })
    }
  }, [params.id, contractInfo.PILE.address, contractInfo.PILE.ABI, provider])

  useEffect(() => {
    fetchOutstandingAmount()
  }, [fetchOutstandingAmount]);

  useEffect(() => {
    if (params.id) {
      fetchRepayments()
        .catch((error) => console.error('failed to fetch asset details: ', error));
      fetchAsset()
        .catch((error) => console.error('failed to fetch asset details: ', error));
    }
  }, [params.id])

  return (
    <div className="main-container">
      <div>
        <Typography className="order-title">Loan Details</Typography>
        <Card
          sx={{ minWidth: "300px", maxWidth: "900px", mt: '10px' }}
          className="order-container"
        >
          <CardContent className="order-content">
            <div className="header">
              <Typography className="status">Status</Typography>
              <Typography className="status-type">{assetDetails.status}</Typography>
            </div>
            <Grid container className="content">
              <Grid item xs={5} className="item">
                {/*<div className="unit">*/}
                {/*  <Typography>Available for financing</Typography>*/}
                {/*  <Typography>0.00 USDC</Typography>*/}
                {/*</div>*/}
                <div className="unit">
                  <Typography>Outstanding</Typography>
                  <Typography>{outstandingAmount.toLocaleString()} USDC</Typography>
                </div>
                <div className="unit">
                  <Typography>Maturity Date</Typography>
                  <Typography>{assetDetails.maturityDate ? new Date(assetDetails.maturityDate * 1000).toDateString() : '-'}</Typography>
                </div>
                {/*<div className="unit">*/}
                {/*  <Typography>Financed By</Typography>*/}
                {/*  <Typography>0x435838979209..</Typography>*/}
                {/*</div>*/}
              </Grid>
              <Grid item xs={5} className="item">
                <div className="unit">
                  <Typography>Financing Fee</Typography>
                  <Typography>{(assetDetails.financeFee && `${Number(assetDetails.financeFee || '0').toFixed(2)} %`) || '-'}</Typography>
                </div>
                <div className="unit">
                  <Typography>Total Financed</Typography>
                  <Typography>{(assetDetails.principal && `${Number(assetDetails.principal) / (10 ** 6)} USDC`) || '-'}</Typography>
                </div>
                <div className="unit">
                  <Typography>Total repaid</Typography>
                  <Typography>{(assetDetails.repaidAmount && `${Number(assetDetails.repaidAmount) / (10 ** 6)} USDC`) || '-'}</Typography>
                </div>
                {/*<div className="unit">*/}
                {/*  <Typography>Financing Fee</Typography>*/}
                {/*  <Typography>11.33%</Typography>*/}
                {/*</div>*/}
              </Grid>

              {/* <Grid className="item">
              <Typography>Financing fee</Typography>
              <Typography>0.00 DAI</Typography>
            </Grid> */}
            </Grid>
          </CardContent>
        </Card>
      </div>
      <div style={{ marginTop: '40px' }}>
        <Typography className="order-title">Repayments</Typography>
        <TableContainer component={Paper} className="table-container" sx={{mt: '10px'}}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table" className="table">
            <TableHead className="table-head">
              <TableRow className="head-row">
                <TableCell className="head-cell">Date</TableCell>
                <TableCell className="head-cell">Amount</TableCell>
                <TableCell className="head-cell">Loan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="table-body">
              {apiCallStatus ? <TableRow className="body-row">
                <TableCell colSpan={3}>
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress/>
                  </Box>
                </TableCell>
              </TableRow> : !repays.length ? <TableRow className="body-row">
                <TableCell colSpan={3}>
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <Typography component="span" sx={{ fontSize: 'medium' }}>
                      No repayments received yet...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow> : repays.map((row, i) => (
                <TableRow
                  key={i}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  className="body-row"
                >
                  <TableCell>{row.blockTimestamp ? new Date(Number(row.blockTimestamp) * 1000).toDateString() : '-'}</TableCell>
                  <TableCell>{(row.currencyAmount && `${Number(row.currencyAmount) / (10 ** 6)} USDC`) || '-'}</TableCell>
                  <TableCell>{row.loan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <Card
        sx={{ minWidth: "300px", maxWidth: "900px", marginTop: "30px", display: 'none' }}
        className="order-container"
      >
        <CardContent className="order-content">
          <div className="header">
            <Typography className="status">Risk</Typography>
          </div>
          <Grid container className="content">
            <Grid item xs={5} className="item">
              <div className="unit">
                <Typography>Risk group</Typography>
                <Typography>6</Typography>
              </div>
              <div className="unit">
                <Typography>Applied write-off</Typography>
                <Typography>0%</Typography>
              </div>
            </Grid>
            <Grid item xs={5} className="item">
              <div className="unit">
                <Typography>Applied risk adjustment</Typography>
                <Typography>0.33%</Typography>
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
}

export default Order;
