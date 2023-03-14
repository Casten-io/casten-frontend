import { useCallback, useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableContainer, Box,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

import { backendUrl, subgraphUrl } from '../../constants';
import { RootState } from '../../store';

import './style.scss';
import { createClient } from 'urql';

export interface IAssetsheet {
  secId: string;
  secName: string;
  description: string;
  value: string;
  financedate: string;
  maturity: string;
  status: string;
}
export interface IProductIcon {
  [key: string]: string;
}
export interface IAssetIcons {
  [key: string]: string[];
}

function createData(
  secId: string,
  secName: string,
  description: string,
  value: string,
  financedate: string,
  maturity: string,
  status: string
) {
  return {
    secId,
    secName,
    description,
    value,
    financedate,
    maturity,
    status,
  };
}

function OrderList() {
  const rows = [
    createData(
      "AFT001",
      "USDC DAI",
      "Real Time Asset Description",
      "$5MM",
      "Dec 23",
      "Dec 23",
      "Active"
    ),
    createData(
      "AFT002",
      "USDC DAI",
      "Real Time Asset Description",
      "$2MM",
      "Nov 23",
      "Dec 23",
      "Active"
    ),
  ];
  const navigate = useNavigate();
  const [apiCallStatus, setApiCallStatus] = useState<boolean>(false);
  const [assetList, setAssetList] = useState<any[]>([]);

  const fetchAssetList = async () => {
    setApiCallStatus(true);
    const client = createClient({
      url: subgraphUrl,
    });
    const resp = await client.query(
      `query {
          loans {
            id
            borrower
            nftId
            nftRegistry
            maturityDate
            status
          }
        }`,
      {},
    ).toPromise();
    setApiCallStatus(false);
    setAssetList(resp.data.loans);
  };

  useEffect(() => {
    fetchAssetList()
      .catch((error) => console.error('error while fetching asset list: ', error));
  }, []);

  const navigateToAsset = () => {
    navigate("/asset");
  };
  return (
    <TableContainer component={Paper} className="table-container">
      <Table sx={{ minWidth: 650 }} aria-label="simple table" className="table">
        <TableHead className="table-head">
          <TableRow className="head-row">
            <TableCell className="head-cell">ID</TableCell>
            <TableCell className="head-cell">Name</TableCell>
            <TableCell className="head-cell">Description</TableCell>
            <TableCell className="head-cell">Value</TableCell>
            <TableCell className="head-cell">Finance Date</TableCell>
            <TableCell className="head-cell">Maturity</TableCell>
            <TableCell className="head-cell">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="table-body">
          {apiCallStatus ? <TableRow className="body-row">
              <TableCell colSpan={12}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <CircularProgress />
                </Box>
              </TableCell>
          </TableRow> : assetList.map((row) => (
            <TableRow
              key={row.loanID}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="body-row"
              onClick={navigateToAsset}
            >
              <TableCell>{row.loanID || row.id}</TableCell>
              <TableCell>{row.Name || '-'}</TableCell>
              <TableCell>{row.Description || '-'}</TableCell>
              <TableCell>{row.value || '-'}</TableCell>
              <TableCell>{row.finance_date ? new Date(row.finance_date).toDateString() : '-'}</TableCell>
              <TableCell>{row.maturityDate ? new Date(row.maturityDate * 1000).toDateString() : '-'}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default OrderList;
