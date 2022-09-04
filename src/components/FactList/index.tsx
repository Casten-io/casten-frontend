import facts from "./fact-mock";
import "./style.scss";
import { useEffect, useState } from "react";
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

export interface IFactsheet {
  secId: string;
  secName: string;
  tranche: string;
  totalIssuance: string;
  apy: string;
  frequency: string;
  maturity: string;
  ltv: string;
  leverage: string;
}

function createData(
  secId: string,
  secName: string,
  tranche: string,
  totalIssuance: string,
  apy: string,
  frequency: string,
  maturity: string,
  ltv: string,
  leverage: string
) {
  return {
    secId,
    secName,
    tranche,
    totalIssuance,
    apy,
    frequency,
    maturity,
    ltv,
    leverage,
  };
}

function FactList() {
  const rows = [
    createData(
      "AFT001",
      "Sr. A Fintech 11% 2023",
      "Senior",
      "$5MM",
      "11.00%",
      "Monthly",
      "Dec 23",
      "0.8",
      "3.0"
    ),
    createData(
      "AFT002",
      "Jr. A Fintech 11% 2023",
      "Junior",
      "$2MM",
      "15.00%",
      "Monthly",
      "Dec 23",
      "0.8",
      "3.0"
    ),
  ];
  return (
    <TableContainer component={Paper} className="table-container">
      <Table sx={{ minWidth: 650 }} aria-label="simple table" className="table">
        <TableHead className="table-head">
          <TableRow className="head-row">
            <TableCell className="head-cell">SecID</TableCell>
            <TableCell className="head-cell">Sec Name</TableCell>
            <TableCell className="head-cell">Tranche</TableCell>
            <TableCell className="head-cell">Total Issuance</TableCell>
            <TableCell className="head-cell">APY</TableCell>
            <TableCell className="head-cell">Frequency</TableCell>
            <TableCell className="head-cell">Maturity</TableCell>
            <TableCell className="head-cell">LTV</TableCell>
            <TableCell className="head-cell">Leverage</TableCell>
            <TableCell className="head-cell"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="table-body">
          {rows.map((row) => (
            <TableRow
              key={row.secId}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="body-row"
            >
              <TableCell component="th" scope="row">
                {row.secId}
              </TableCell>
              <TableCell>{row.secName}</TableCell>
              <TableCell>{row.tranche}</TableCell>
              <TableCell>{row.totalIssuance}</TableCell>
              <TableCell>{row.apy}</TableCell>
              <TableCell>{row.frequency}</TableCell>
              <TableCell>{row.maturity}</TableCell>
              <TableCell>{row.ltv}</TableCell>
              <TableCell>{row.leverage}</TableCell>
              <TableCell className="invest-button">
                <span className="invest">Invest</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default FactList;
