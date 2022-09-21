import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";
import "./style.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function createData(
  secId: string,
  secName: string,
  apy: string,
  frequency: string,
  maturity: string,
  issuer: string,
  totalIssuance: string,
  availableIssuance: string,
  category: string,
  ltv: string,
  leverage: string,
  moreInfo: string
) {
  return {
    secId,
    secName,
    apy,
    frequency,
    maturity,
    issuer,
    totalIssuance,
    availableIssuance,
    category,
    ltv,
    leverage,
    moreInfo,
  };
}

function ProductList() {
  const navigate = useNavigate();

  const navigateToSecurity = () => {
    navigate("/security");
  };

  const rows = [
    createData(
      "FTECHSR420",
      "A Fintech SR 11% 2023",
      "11.21",
      "Monthly",
      "Dec 23",
      "Cauris Finance",
      "$5MM",
      "$1.2MM",
      "Revenue based/Invoice Discounting",
      "0.8",
      "3.0",
      "More Info"
    ),
  ];
  return (
    <TableContainer component={Paper} className="table-container">
      <Table sx={{ minWidth: 650 }} aria-label="simple table" className="table">
        <TableHead className="table-head">
          <TableRow className="head-row">
            <TableCell className="head-cell">SecID</TableCell>
            <TableCell className="head-cell">Sec Name</TableCell>
            <TableCell className="head-cell">APY</TableCell>
            <TableCell className="head-cell">Frequency</TableCell>
            <TableCell className="head-cell">Maturity</TableCell>
            <TableCell className="head-cell">Issuer</TableCell>
            <TableCell className="head-cell">Total Issuance</TableCell>
            <TableCell className="head-cell">Available Issuance</TableCell>
            <TableCell className="head-cell">Category</TableCell>
            <TableCell className="head-cell">LTV</TableCell>
            <TableCell className="head-cell">Leverage</TableCell>
            <TableCell className="head-cell">More Info</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="table-body">
          {rows.map((row) => (
            <TableRow
              key={row.secId}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              onClick={navigateToSecurity}
              className="body-row"
            >
              <TableCell component="th" scope="row">
                {row.secId}
              </TableCell>
              <TableCell>{row.secName}</TableCell>
              <TableCell>{row.apy}</TableCell>
              <TableCell>{row.frequency}</TableCell>
              <TableCell>{row.maturity}</TableCell>
              <TableCell>{row.issuer}</TableCell>
              <TableCell>{row.totalIssuance}</TableCell>
              <TableCell>{row.availableIssuance}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>{row.ltv}</TableCell>
              <TableCell>{row.leverage}</TableCell>
              <TableCell>{row.moreInfo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ProductList;
