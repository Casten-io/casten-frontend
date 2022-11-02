import { ethers, BigNumber } from "ethers";
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
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Address, ADDRESS_BY_NETWORK_ID } from "../../constants/address";
import { debug } from "util";

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
  leverage: string,
  current: string
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
    current,
  };
}

function FactList({ amount }: { amount: string }) {
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
      "3.0",
      "$1200"
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
      "3.0",
      "$6500"
    ),
  ];

  const networkInfo = useSelector(
    (state: RootState) => state.account.networkInfo
  );
  const provider = useSelector((state: RootState) => state.account.provider);
  const address = useSelector((state: RootState) => state.account.address);

  const contractInfo =
    ADDRESS_BY_NETWORK_ID[networkInfo?.chainId.toString() as Address | "80001"];

  const investNow = async (investType: string): Promise<void> => {
    const DaiContract = new ethers.Contract(
      contractInfo.DAI_TOKEN.address,
      contractInfo.DAI_TOKEN.ABI,
      provider?.getSigner()
    );
    const juniorOperatorContract = new ethers.Contract(
      contractInfo.JUNIOR_OPERATOR.address,
      contractInfo.JUNIOR_OPERATOR.ABI,
      provider?.getSigner()
    );
    const seniorOperatorContract = new ethers.Contract(
      contractInfo.SENIOR_OPERATOR.address,
      contractInfo.SENIOR_OPERATOR.ABI,
      provider?.getSigner()
    );
    const SeniorTranche = contractInfo.SENIOR_TRANCHE.address;
    const JuniorTranche = contractInfo.JUNIOR_TRANCHE.address;
    const amountBN = BigNumber.from(amount).mul(BigNumber.from(10).pow(18));
    if (investType === "Senior") {
      const allowance = await DaiContract.allowance(address, SeniorTranche);
      if (allowance.lt(amountBN)) {
        await DaiContract.approve(SeniorTranche, amountBN);
      }
      await seniorOperatorContract.supplyOrder(amountBN);
    } else {
      const allowance = await DaiContract.allowance(address, JuniorTranche);
      if (allowance.lt(amountBN)) {
        await DaiContract.approve(JuniorTranche, amountBN);
      }
      await juniorOperatorContract.supplyOrder(amountBN);
    }
  };

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
            <TableCell className="head-cell">Current</TableCell>
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
              <TableCell>{row.current}</TableCell>
              <TableCell className="invest-button">
                <span className="invest" onClick={() => investNow(row.tranche)}>
                  Invest
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default FactList;
