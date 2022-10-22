import {useCallback, useEffect, useState} from "react";
import {
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableContainer, Modal, Box, Typography, TextField, Switch,
} from "@mui/material";
import "./style.scss";
import {BigNumber, ethers} from "ethers";
import {Address, ADDRESS_BY_NETWORK_ID} from '../../constants/address';
import {useSelector} from "react-redux";
import {RootState} from '../../store';

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

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function createData(
  secId: string,
  secName: string,
  description: string,
  value: string,
  financedate: string,
  maturity: string,
  status: string,
  tranche: string
) {
  return {
    secId,
    secName,
    description,
    value,
    financedate,
    maturity,
    status,
    tranche
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
      "Active",
      "Senior"
    ),
    createData(
      "AFT002",
      "USDC DAI",
      "Real Time Asset Description",
      "$2MM",
      "Nov 23",
      "Dec 23",
      "Active",
      "Junior"
    ),
  ];
  const [withdrawalAmount, setWithdrawalAmounts] = useState<any>({
    juniorToken: BigNumber.from('0'),
    seniorToken: BigNumber.from('0'),
    remainingJuniorToken: BigNumber.from('0'),
    remainingSeniorToken: BigNumber.from('0')
  })
  const [inputWithdrawal, setInputWithdrawal] = useState<number>(0)
  const [openWithdraw, setOpenWithdraw] = useState<boolean>(false)
  const [openClaim, setOpenClaim] = useState<boolean>(false)
  const [selectedTranche, setSelectedTranche] = useState<string>('Senior')
  const [actionBtns, setActionBtns] = useState<boolean>(true)

  const networkInfo = useSelector(
    (state: RootState) => state.account.networkInfo
  );
  const provider = useSelector((state: RootState) => state.account.provider);
  const address = useSelector((state: RootState) => state.account.address);

  const contractInfo =
    ADDRESS_BY_NETWORK_ID[networkInfo?.chainId.toString() as Address | "80001"];

  const calculateDisburseAndEnableAction = useCallback(async () => {
    try {
      if (!address) {
        return;
      }
      const seniorToken = new ethers.Contract(contractInfo.SENIOR_TOKEN.address, contractInfo.SENIOR_TOKEN.ABI, provider?.getSigner());
      const juniorToken = new ethers.Contract(contractInfo.JUNIOR_TOKEN.address, contractInfo.JUNIOR_TOKEN.ABI, provider?.getSigner());
      const seniorTokenBalance = await seniorToken.balanceOf(address);
      const juniorTokenBalance = await juniorToken.balanceOf(address);
      const seniorMemberList = new ethers.Contract(contractInfo.SENIOR_MEMBER_LIST.address, contractInfo.SENIOR_MEMBER_LIST.ABI, provider?.getSigner());
      const juniorMemberList = new ethers.Contract(contractInfo.JUNIOR_MEMBER_LIST.address, contractInfo.JUNIOR_MEMBER_LIST.ABI, provider?.getSigner());
      const seniorMember = await seniorMemberList.hasMember(address);
      const juniorMember = await juniorMemberList.hasMember(address);
      const seniorTrancheContract = new ethers.Contract(contractInfo.SENIOR_TRANCHE.address, contractInfo.SENIOR_TRANCHE.ABI, provider?.getSigner());
      const seniorDisburseDetails = await seniorTrancheContract['calcDisburse(address)'](address);
      const juniorTrancheContract = new ethers.Contract(contractInfo.JUNIOR_TRANCHE.address, contractInfo.JUNIOR_TRANCHE.ABI, provider?.getSigner());
      const juniorDisburseDetails = await juniorTrancheContract['calcDisburse(address)'](address);
      setWithdrawalAmounts({
        juniorToken: juniorDisburseDetails.payoutTokenAmount,
        seniorToken: seniorDisburseDetails.payoutTokenAmount,
        remainingJuniorToken: juniorTokenBalance,
        remainingSeniorToken: seniorTokenBalance,
      })
      if (
        (
          juniorDisburseDetails.payoutTokenAmount.gt(BigNumber.from(0)) ||
          seniorDisburseDetails.payoutTokenAmount.gt(BigNumber.from(0))
        ) &&
        (seniorMember || juniorMember)
      ) {
        setActionBtns(true)
      }
    } catch (e) {
      console.error('withdrawal amount calculation failed: ', e)
    }
  }, [address])

  const withdraw = useCallback(async () => {
    if (!address) {
      return;
    }
    let contract;
    let token;
    let operatorAddress;
    if (selectedTranche === 'Senior') {
      operatorAddress = contractInfo.SENIOR_TRANCHE.address
      token = new ethers.Contract(contractInfo.SENIOR_TOKEN.address, contractInfo.SENIOR_TOKEN.ABI, provider?.getSigner())
      contract = new ethers.Contract(contractInfo.SENIOR_OPERATOR.address, contractInfo.SENIOR_OPERATOR.ABI, provider?.getSigner());
    } else {
      operatorAddress = contractInfo.JUNIOR_TRANCHE.address
      token = new ethers.Contract(contractInfo.JUNIOR_TOKEN.address, contractInfo.JUNIOR_TOKEN.ABI, provider?.getSigner())
      contract = new ethers.Contract(contractInfo.JUNIOR_OPERATOR.address, contractInfo.JUNIOR_OPERATOR.ABI, provider?.getSigner());
    }

    const amountBN = BigNumber.from(
      inputWithdrawal || withdrawalAmount[selectedTranche === 'Senior' ? 'remainingSeniorToken' : 'remainingJuniorToken']
    ).mul(BigNumber.from(10).pow(18));

    const allowance = await token.allowance(address, operatorAddress);
    if(allowance.lt(amountBN)) {
      await token.approve(operatorAddress, amountBN)
    }
    const withdrawTX = await contract.redeemOrder(amountBN);

    await withdrawTX.wait();

    setOpenWithdraw(false);
  }, [inputWithdrawal, selectedTranche, withdrawalAmount])

  const claim = useCallback(async () => {
    if (!address || !provider) {
      return;
    }
    let contract;
    if (selectedTranche === 'Senior') {
      contract = new ethers.Contract(contractInfo.SENIOR_OPERATOR.address, contractInfo.SENIOR_OPERATOR.ABI, provider?.getSigner());
    } else {
      contract = new ethers.Contract(contractInfo.JUNIOR_OPERATOR.address, contractInfo.JUNIOR_OPERATOR.ABI, provider?.getSigner());
    }

    const disburseTx = await contract['disburse()']()


    await disburseTx.wait();

    calculateDisburseAndEnableAction()
      .catch((e) => {
        console.error('failed to calculate withdrawal amount', e)
      })
      .finally(() => {
        setOpenClaim(false);
      })
    // setWithdrawalAmounts({
    //   ...withdrawalAmount,
    //   [selectedTranche === 'Senior' ? 'seniorToken' : 'juniorToken']: withdrawalAmts
    // })
  }, [withdrawalAmount, selectedTranche])

  useEffect(() => {
    if (address) {
      calculateDisburseAndEnableAction()
        .catch((e) => {
          console.error('failed to calculate withdrawal amount', e)
        })
    }
  }, [address])

  return (
    <>
      {actionBtns && <Box display="flex" width="100%" paddingY="10px" justifyContent="flex-end">
        {(
          withdrawalAmount.remainingSeniorToken.gt(BigNumber.from(0)) ||
          withdrawalAmount.remainingJuniorToken.gt(BigNumber.from(0))
        ) && <Button
          onClick={() => setOpenWithdraw(true)}
          variant="outlined"
          color="success"
          sx={{mr: 2}}
        >
          Withdraw
        </Button>}
        {(
          withdrawalAmount.seniorToken.gt(BigNumber.from(0)) ||
          withdrawalAmount.juniorToken.gt(BigNumber.from(0))
        ) && <Button
          onClick={() => setOpenClaim(true)}
          variant="outlined"
          color="success"
        >
          Claim
        </Button>}
      </Box>}
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
            {rows.map((row, i) => (
              <TableRow
                key={row.secId}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                className="body-row"
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
      <Modal
        open={openClaim}
        onClose={() => setOpenClaim(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Please select from which pool you want to claim.
          </Typography>
          <Box display="flex" justifyContent="space-between" >
            Senior <Switch
              onChange={(e) => setSelectedTranche(e.target.checked ? 'Junior' : 'Senior')}
              checked={selectedTranche === 'Junior'}
            /> Junior
          </Box>
          <Box display="flex" justifyContent="space-between" >
            <Button onClick={() => setOpenClaim(false)}>
              Cancel
            </Button>
            <Button onClick={claim} >
              Claim
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openWithdraw}
        onClose={() => setOpenWithdraw(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Enter Amount to Withdraw or leave it blank to withdraw full amount
          </Typography>
          <TextField
            id="outlined-basic"
            label="$"
            variant="outlined"
            type="number"
            onChange={(e) => setInputWithdrawal(Number(e.target.value))}
            error={BigNumber
              .from(inputWithdrawal || 0)
              .mul(BigNumber.from(10).pow(18))
              .gt(withdrawalAmount[selectedTranche === 'Senior' ? 'remainingSeniorToken' : 'remainingJuniorToken'])}
          />
          {BigNumber
            .from(inputWithdrawal || 0)
            .mul(BigNumber.from(10).pow(18))
            .gt(withdrawalAmount[selectedTranche === 'Senior' ? 'remainingSeniorToken' : 'remainingJuniorToken']) && <Typography color="red">
            Please enter amount within withdrawal limit
          </Typography>}
          <Typography>
            available amount of {selectedTranche} Pool is {(Number(withdrawalAmount[selectedTranche === 'Senior' ? 'remainingSeniorToken' : 'remainingJuniorToken'])/(10**18)).toString()}
          </Typography>
          <Box display="flex" justifyContent="space-between" >
            Senior <Switch
              onChange={(e) => setSelectedTranche(e.target.checked ? 'Junior' : 'Senior')}
              checked={selectedTranche === 'Junior'}
            /> Junior
          </Box>
          <Box display="flex" justifyContent="space-between" >
            <Button onClick={() => setOpenWithdraw(false)}>
              Cancel
            </Button>
            <Button onClick={withdraw} >
              Withdraw
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default OrderList;
