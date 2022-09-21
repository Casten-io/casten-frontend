import "./style.scss";
import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
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

export interface IPortfoliosheet {
  select: string;
  symbol: string;
  sec_name: string;
  issuer: string;
  apy: string;
  maturity: string;
  tranche: string;
  frequency: string;
  price: string;
  profitloss: string;
  invested: string;
  exposure: string;
  percent_exp: string;
}

function createData(
  select: string,
  symbol: string,
  sec_name: string,
  issuer: string,
  apy: string,
  maturity: string,
  tranche: string,
  frequency: string,
  price: string,
  profitloss: string,
  invested: string,
  exposure: string,
  percent_exp: string
) {
  return {
    select,
    symbol,
    sec_name,
    issuer,
    apy,
    maturity,
    tranche,
    frequency,
    price,
    profitloss,
    invested,
    exposure,
    percent_exp,
  };
}

function PortfolioList() {
  const navigate = useNavigate();

  const securityRedirect = useCallback(() => navigate("/security"), [navigate]);

  const rows = [
    createData(
      "",
      "FTech SNR",
      "Sr. A Fintech 11%",
      "A Fintech",
      "10.5%",
      "Dec 2023",
      "Senior",
      "Monthly",
      "1.0",
      "10,000",
      "500,000",
      "510,000",
      "51%"
    ),
  ];
  return (
    <TableContainer component={Paper} className="table-container">
      <Table sx={{ minWidth: 650 }} aria-label="simple table" className="table">
        <TableHead className="table-head">
          <TableRow className="head-row">
            <TableCell className="head-cell">Select</TableCell>
            <TableCell className="head-cell">Symbol</TableCell>
            <TableCell className="head-cell">Sec Name</TableCell>
            <TableCell className="head-cell">Issuer</TableCell>
            <TableCell className="head-cell">APY</TableCell>
            <TableCell className="head-cell">Maturity</TableCell>
            <TableCell className="head-cell">Tranche</TableCell>
            <TableCell className="head-cell">Frequency</TableCell>
            <TableCell className="head-cell">Price</TableCell>
            <TableCell className="head-cell">P/L</TableCell>
            <TableCell className="head-cell">Amt. Invested</TableCell>
            <TableCell className="head-cell">Exposure</TableCell>
            <TableCell className="head-cell">% Exp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="table-body">
          {rows.map((row) => (
            <TableRow
              key={row.sec_name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="body-row"
            >
              <TableCell component="th" scope="row">
                {row.select}
              </TableCell>
              <TableCell>{row.symbol}</TableCell>
              <TableCell>{row.sec_name}</TableCell>
              <TableCell>{row.issuer}</TableCell>
              <TableCell>{row.apy}</TableCell>
              <TableCell>{row.maturity}</TableCell>
              <TableCell>{row.tranche}</TableCell>
              <TableCell>{row.frequency}</TableCell>
              <TableCell>{row.price}</TableCell>
              <TableCell>{row.profitloss}</TableCell>
              <TableCell>{row.invested}</TableCell>
              <TableCell>{row.exposure}</TableCell>
              <TableCell>{row.percent_exp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PortfolioList;
