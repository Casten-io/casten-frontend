import { ethers, BigNumber } from "ethers";
import "./style.scss";
import { useCallback, useEffect, useState } from "react";
import { Modal, Typography, Box, Button, TextField } from "@mui/material";
import { Grid, Paper, Table, TableBody, TableHead, TableRow, TableCell, TableContainer } from "@mui/material";
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
  APY: number,
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
    APY,
    frequency,
    maturity,
    ltv,
    leverage,
    current,
  };
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

function FactList() {
  const rows = [
    createData(
      "AFT001",
      "Sr. A Fintech 11% 2023",
      "Senior",
      "$5MM",
      "11.00%",
      11,
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
      15,
      "Monthly",
      "Dec 23",
      "0.8",
      "3.0",
      "$6500"
    ),
  ];

  const networkInfo = useSelector((state: RootState) => state.account.networkInfo);
  const provider = useSelector((state: RootState) => state.account.provider);
  const address = useSelector((state: RootState) => state.account.address);
  const [investIn, setInvestIn] = useState<any | null>(null);
  const [investAmount, setInvestAmount] = useState<number>();
  const [investAmountError, setInvestAmountError] = useState(false);

  const contractInfo = ADDRESS_BY_NETWORK_ID[networkInfo?.chainId.toString() as Address | "80001"];

  // const openModal = (invest: string) => {
  //   return (
  //     <Modal open={open} onClose={() => setOpen(!open)}>
  //       <Box>
  //         <Typography id="modal-modal-title" variant="h6" component="h2">
  //           Text in a modal
  //         </Typography>
  //         <Typography id="modal-modal-description" sx={{ mt: 2 }}>
  //           Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
  //         </Typography>
  //         <Button onClick={() => investNow(invest)} />
  //       </Box>
  //     </Modal>
  //   );
  // };

  const investNow = useCallback(async (): Promise<void> => {
    if (!investIn) {
      return;
    }
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
    const amountBN = BigNumber.from(investAmount).mul(BigNumber.from(10).pow(contractInfo.DAI_TOKEN.TOKEN_DECIMALS || 18));
    if (investIn.tranche === "Senior") {
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
  }, [investIn]);

  return (
    <>
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
              <TableRow key={row.secId} sx={{ "&:last-child td, &:last-child th": { border: 0 } }} className="body-row">
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
                <span
                  className="invest"
                  onClick={() => setInvestIn(row)}
                  // onClick={() => {
                  //   setOpen(true);
                  //   setInvest(row.tranche);
                  // }}
                >
                  Invest
                </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={Boolean(investIn?.secId)}
        onClose={() => setInvestIn(null)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Enter Amount to Invest in {investIn?.tranche} Pool.
          </Typography>
          <Box mb={2}>
            <TextField
              id="outlined-basic"
              label="$"
              variant="outlined"
              type="number"
              fullWidth
              onChange={(e) => {
                setInvestAmount(Number(e.target.value))
                setInvestAmountError(BigNumber
                  .from(Number(e.target.value) || 0)
                  .mul(BigNumber.from(10).pow(18))
                  .lte(BigNumber.from(0)));
              }}
              error={investAmountError}
            />
            {investAmountError && <Typography id="invest-amount-error" variant="caption" component="span" color="red">
              Please enter valid amount to invest
            </Typography>}
            {!!investAmount && <Typography id="investment-apy" variant="caption" component="span">
              you are depositing in {investIn?.tranche} tranche, which is has an estimated APY for {investIn?.apy}%.
              You will be eligible to withdraw ${(investAmount * (investIn?.APY / 100)).toFixed(2)} if you stay deposited for 1 year
            </Typography>}
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Button onClick={() => setInvestIn(null)} variant="outlined" color="warning">
              Cancel
            </Button>
            <Button onClick={investNow} variant="outlined" color="success">
              Invest Now
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default FactList;
