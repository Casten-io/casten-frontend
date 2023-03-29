import {
  Grid,
  Button,
  Paper,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  Box,
} from "@mui/material";
import "./style.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from 'urql';
import { subgraphUrl } from '../../constants';
import { CircularProgress } from '@material-ui/core';

function createData(
  secId: string,
  secName: string,
  apy: string,
  jApy: string,
  frequency: string,
  maturity: string,
  issuer: string,
  totalIssuance: string,
  availableIssuance: string,
  category: string,
  ltv: string,
  leverage: string,
  moreInfo: string,
  disabled = false,
) {
  return {
    secId,
    secName,
    apy,
    jApy,
    frequency,
    maturity,
    issuer,
    totalIssuance,
    availableIssuance,
    category,
    ltv,
    leverage,
    moreInfo,
    disabled,
  };
}

function ProductList() {
  const [pools, setPools] = useState<any[]>([]);
  const [apiCallStatus, setApiCallStatus] = useState<boolean>(true);
  const navigate = useNavigate();

  const navigateToTokenOfferings = (row: any) => () => {
    if (row.disabled) {
      return;
    }
    navigate("/token");
  };

  const fetchPoolDetails = async () => {
    const client = createClient({
      url: subgraphUrl,
    });

    const resp = await client.query(
      `query {
        pools {
          id
          data {
            name
            shelfAddress
            coordinatorAddress
            memberlistAddress
            seniorTrancheAddress
            seniorTrancheAddress
            juniorTrancheAddress
            seniorOperatorAddress
            juniorOperatorAddress
            reserveAddress
          }
          seniorTVL
          juniorTVL
          expectedSeniorAPY
          expectedJuniorAPY
          totalIssuance
          currentIssuance
          seniorTranche {
            id
            tokenName
            tokenSymbol
            name
            tokenPrice
          }
          juniorTranche {
            id
            tokenName
            tokenSymbol
            name
            tokenPrice
          }
          repaymentFrequency
        }
      }`,
      {},
    ).toPromise();

    setPools([
      ...resp.data.pools.map((pool: any) => createData(
        pool.id as string,
        pool.data.name as string,
        `${Number(pool.expectedSeniorAPY).toFixed(2)}%`,
        `${Number(pool.expectedJuniorAPY).toFixed(2)}%`,
        pool.repaymentFrequency,
        'Dec 23',
        pool.data.name as string,
        `${Number(BigInt(pool.totalIssuance || '0') / BigInt((10 ** 6))).toLocaleString()} USDC`,
        `${(
          Number(BigInt(pool.totalIssuance || '0') / BigInt((10 ** 6))) -
          Number(BigInt(pool.currentIssuance || '0') / BigInt((10 ** 6)))
        ).toLocaleString()} USDC`,
        "SME Loans",
        "0.8",
        "3.0",
        "Details"
      ))
    ]);
    setApiCallStatus(false);
  };

  useEffect(() => {
    fetchPoolDetails()
      .catch((error) => {
        console.error('error while fetching pools: ', error);
        setApiCallStatus(false);
      });
  }, []);

  return (
    <TableContainer component={Paper} className="table-container">
      <Table sx={{ minWidth: 650 }} aria-label="simple table" className="table">
        <TableHead className="table-head">
          <TableRow className="head-row">
            {/* <TableCell className="head-cell">Token ID</TableCell>
            <TableCell className="head-cell">Token Name</TableCell> */}
            <TableCell className="head-cell">Borrower</TableCell>
            <TableCell className="head-cell">Category</TableCell>
            <TableCell className="head-cell">Total Issuance</TableCell>
            <TableCell className="head-cell">Available Issuance</TableCell>
            <TableCell className="head-cell">Senior APY</TableCell>
            <TableCell className="head-cell">Junior APY</TableCell>
            {/* <TableCell className="head-cell">Frequency</TableCell>
            <TableCell className="head-cell">Maturity</TableCell>

     */}
            {/* <TableCell className="head-cell">LTV</TableCell>
            <TableCell className="head-cell">Leverage</TableCell> */}
            <TableCell className="head-cell">More Info</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="table-body">
          {apiCallStatus ? <TableRow className="body-row">
            <TableCell colSpan={7}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress />
              </Box>
            </TableCell>
          </TableRow> : pools.map((row) => (
            <TableRow
              key={row.secId}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              onClick={navigateToTokenOfferings(row)}
              className={`body-row${row.disabled ? ' disabled' : ''}`}
            >
              {/* <TableCell component="th" scope="row">
                {row.secId}
              </TableCell>
              <TableCell>{row.secName}</TableCell> */}
              <TableCell>{row.issuer}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>{row.totalIssuance}</TableCell>
              <TableCell>{row.availableIssuance}</TableCell>
              <TableCell>{row.apy}</TableCell>
              <TableCell>{row.jApy}</TableCell>
              {/* <TableCell>{row.frequency}</TableCell>
              <TableCell>{row.maturity}</TableCell>
               */}

              {/* <TableCell>{row.ltv}</TableCell>
              <TableCell>{row.leverage}</TableCell> */}
              <TableCell className="special-cell">
                <div className="button">{row.moreInfo}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ProductList;
