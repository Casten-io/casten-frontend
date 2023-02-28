import { Grid, Button, Paper, Table, TableBody, TableHead, TableRow, TableCell, TableContainer } from "@mui/material";
import "./style.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const navigateToTokenOfferings = (row: any) => () => {
    if (row.disabled) {
      return;
    }
    navigate("/token");
  };

  const rows = [
    createData(
      "FTECHSR420",
      "A Fintech SR 11% 2023",
      "15%",
      "21%",
      "Monthly",
      "Dec 23",
      "QuickCheck",
      "$200K",
      "$200K",
      "SME Loans",
      "0.8",
      "3.0",
      "Details"
    ),
    createData(
      "FTECHSR420",
      "A Fintech SR 11% 2023",
      "11.21%",
      "18.79%",
      "Monthly",
      "Dec 23",
      "Cauris Finance",
      "$5MM",
      "$1.2MM",
      "Revenue based/Invoice Discounting",
      "0.8",
      "3.0",
      "Details",
      true
    ),
    createData(
      "FTECHSR69",
      "B Fintech SR 13% 2023",
      "13.61%",
      "15.32%",
      "Monthly",
      "Jan 24",
      "Lazy Pay",
      "$8.3MM",
      "$2.9MM",
      "Invoice Discounting",
      "0.8",
      "3.0",
      "Details",
      true
    ),
  ];
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
          {rows.map((row) => (
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
