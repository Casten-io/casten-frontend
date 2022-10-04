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
          {rows.map((row) => (
            <TableRow
              key={row.secId}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="body-row"
              onClick={navigateToAsset}
            >
              <TableCell>{row.secId}</TableCell>
              <TableCell>{row.secName}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.value}</TableCell>
              <TableCell>{row.financedate}</TableCell>
              <TableCell>{row.maturity}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default OrderList;
