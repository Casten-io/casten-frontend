import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ethers, BigNumber, Contract } from 'ethers';
import { Modal, Typography, Box, TextField, debounce, LinearProgress } from '@mui/material';
import { Paper, Table, TableBody, TableHead, TableRow, TableCell, TableContainer } from '@mui/material';

import { RootState } from '../../store';
import { Address, ADDRESS_BY_NETWORK_ID } from '../../constants/address';
import ArrowNE from '../../assets/icons/Arrow-NorthEast.svg';
import { parseBalance, scanTxLink } from '../../utils';
import { subgraphUrl } from '../../constants';
import SwitchNetworkModal from '../Commons/WalletConnect/SwitchNetworkModal';
import Casten from '../../assets/icons/Casten.png';
import useTokenBalance from '../../hooks/useTokenBalance';

import './style.scss';
import { toggleKycModal, updateWhitelistStatus } from '../../store/slices/account';
import { createClient } from 'urql';
import { CircularProgress } from '@material-ui/core';
import { useWallet } from '../../contexts/WalletContext';

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
  APY: number[],
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

function FactList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const networkInfo = useSelector((state: RootState) => state.account.networkInfo);
  const { provider } = useWallet();
  const address = useSelector((state: RootState) => state.account.address);
  const whitelistStatus = useSelector((state: RootState) => state.account.whitelistStatus);
  const whitelistStatusTimestamp = useSelector((state: RootState) => state.account.whitelistCheckTimestamp) || 0;
  const [factList, setFactList] = useState<any[]>([]);
  const [apiCallStatus, setApiCallStatus] = useState<boolean>(true);
  const [switchNetworkOpen, setSwitchNetworkOpen] = useState(false);
  const [investIn, setInvestIn] = useState<any | null>(null);
  const [investAmount, setInvestAmount] = useState<number | null>(null);
  const [investAmountError, setInvestAmountError] = useState(false);
  const [needApproval, setNeedApproval] = useState(true);
  const [checkingAllowance, setCheckingAllowance] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const [supplying, setSupplying] = useState<boolean>(false);
  const [warningPendingSupply, setWarningPendingSupply] = useState<any>(null);
  const [checkingPendingOrders, setCheckingPendingOrders] = useState<boolean>(false);
  const [supplied, setSupplied] = useState<boolean>(false);
  const [approvalTxHash, setApprovalTxHash] = useState<string>();
  const [supplyTxHash, setSupplyTxHash] = useState<string>();
  const [pendingSupply, setPendingSupply] = useState<any>({});

  const chainId = networkInfo?.chainId || 137
  const contractInfo = useMemo(() => {
    return ADDRESS_BY_NETWORK_ID[chainId.toString() as Address]
  }, [chainId]);
  const { data: tokenBalance } = useTokenBalance(address, contractInfo?.DAI_TOKEN?.address);

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

    const pool = resp.data.pools[0] || {}

    setFactList([
      createData(
        pool.seniorTranche?.tokenSymbol || 'QC001',
        pool.seniorTranche?.tokenName || 'Sr. QuickCheck 15% 2023',
        pool.seniorTranche?.name || 'Senior',
        Number(BigInt(pool.totalIssuance || '0') / BigInt((10 ** 6))).toLocaleString(),
        (pool.expectedSeniorAPY || '0')
          .toString()
          .split('-')
          .map((esa: string) => `${Number(esa).toFixed(2)}%`)
          .join(' - '),
        (pool.expectedSeniorAPY || '0')
          .toString()
          .split('-')
          .map((esa: string) => Number(esa)),
        pool.repaymentFrequency,
        "Sept 23",
        "-",
        "-",
        `${Number(BigInt(pool.seniorTVL) / BigInt(10 ** 6)).toLocaleString()} USDC`
      ),
      createData(
        pool.juniorTranche?.tokenSymbol || 'QC001',
        pool.juniorTranche?.tokenName || 'Sr. QuickCheck 15% 2023',
        pool.juniorTranche?.name || 'Junior',
        Number(BigInt(pool.totalIssuance || '0') / BigInt((10 ** 6))).toLocaleString(),
        (pool.expectedJuniorAPY || '0')
          .toString()
          .split('-')
          .map((eja: string) => `${Number(eja).toFixed(2)}%`)
          .join(' - '),
        (pool.expectedJuniorAPY || '0')
          .toString()
          .split('-')
          .map((eja: string) => Number(eja)),
        pool.repaymentFrequency,
        "Sept 23",
        "-",
        "-",
        `${Number(BigInt(pool.juniorTVL) / BigInt(10 ** 6)).toLocaleString()} USDC`
      ),
    ]);
    setApiCallStatus(false);
  };

  const getContracts = useCallback((tranche: string) => {
    let signer: ethers.providers.Web3Provider | ethers.providers.BaseProvider | ethers.providers.JsonRpcSigner = provider
    if (address) {
      signer = (provider as ethers.providers.Web3Provider).getSigner()
    }
    const token = new ethers.Contract(
      contractInfo.DAI_TOKEN.address,
      contractInfo.DAI_TOKEN.ABI,
      signer
    );
    if (tranche === 'Senior') {
      return {
        operator: new ethers.Contract(
          contractInfo.SENIOR_OPERATOR.address,
          contractInfo.SENIOR_OPERATOR.ABI,
          signer
        ),
        trancheAddress: contractInfo.SENIOR_TRANCHE.address,
        token,
      };
    }
    return {
      operator: new ethers.Contract(
        contractInfo.JUNIOR_OPERATOR.address,
        contractInfo.JUNIOR_OPERATOR.ABI,
        signer
      ),
      trancheAddress: contractInfo.JUNIOR_TRANCHE.address,
      token,
    };
  }, [
    address,
    contractInfo?.DAI_TOKEN?.ABI,
    contractInfo?.DAI_TOKEN?.address,
    contractInfo?.JUNIOR_OPERATOR?.ABI,
    contractInfo?.JUNIOR_OPERATOR?.address,
    contractInfo?.JUNIOR_TRANCHE?.address,
    contractInfo?.SENIOR_OPERATOR?.ABI,
    contractInfo?.SENIOR_OPERATOR?.address,
    contractInfo?.SENIOR_TRANCHE?.address,
    provider,
  ]);

  const debouncedAllowanceCheck = debounce(() => {
    setCheckingAllowance(true);
    const { token, trancheAddress } = getContracts(investIn.tranche);
    const amountBN = BigNumber.from(investAmount).mul(BigNumber.from(10).pow(contractInfo.DAI_TOKEN.TOKEN_DECIMALS || 18));
    token.allowance(address, trancheAddress)
      .then((allowance: BigNumber) => {
        let approvalRequired = false;
        if (allowance.lt(amountBN)) {
          approvalRequired = true;
        }
        setCheckingAllowance(false);
        setNeedApproval(approvalRequired);
      })
      .catch((error: any) => {
        console.error('failed to check allowance: ', error);
        setCheckingAllowance(false);
      });
  }, 500);

  const supplyOrder = useCallback(async (): Promise<void> => {
    if (!investIn) {
      return;
    }
    try {
      setSupplying(true);
      const { operator } = getContracts(investIn.tranche);
      const amountBN = BigNumber.from(investAmount).mul(BigNumber.from(10).pow(contractInfo.DAI_TOKEN.TOKEN_DECIMALS || 18));
      const tx = await operator.supplyOrder(amountBN);
      setSupplyTxHash(tx.hash);
      await tx.wait();
      setSupplied(true);
      setTimeout(() => {
        setSupplied(false);
        setInvestIn(null);
        setInvestAmount(null);
      });
    } catch (error) {
      console.error('approving amount failed: ', error);
    } finally {
      setSupplying(false);
    }
  }, [
    investIn,
    getContracts,
    investAmount,
    contractInfo?.DAI_TOKEN?.TOKEN_DECIMALS,
  ]);

  const clearAmounts = () => {
    setInvestAmount(null);
    setInvestAmountError(false);
  }

  const approveAmount  = useCallback(async (): Promise<void> => {
    if (!investIn) {
      return;
    }
    try {
      setApproving(true);
      const { token, trancheAddress } = getContracts(investIn.tranche);
      const amountBN = BigNumber.from(investAmount).mul(BigNumber.from(10).pow(contractInfo.DAI_TOKEN.TOKEN_DECIMALS || 18));
      const tx = await token.approve(trancheAddress, amountBN);
      setApprovalTxHash(tx.hash);
      await tx.wait();
      setNeedApproval(false);
    } catch (error) {
      console.error('approving amount failed: ', error);
    } finally {
      setApproving(false);
    }
  }, [
    investIn,
    getContracts,
    investAmount,
    contractInfo?.DAI_TOKEN?.TOKEN_DECIMALS,
  ]);

  useEffect(() => {
    if (!investIn || !Number(investAmount)) {
      return;
    }
    debouncedAllowanceCheck();
    return () => {
      debouncedAllowanceCheck.clear();
    }
  }, [investIn, investAmount]);

  const checkPendingSupplyOrders = useCallback(async () => {
    try {
      if (!address || !whitelistStatus) {
        return;
      }
      setCheckingPendingOrders(true);
      const seniorTrancheContract = new ethers.Contract(contractInfo.SENIOR_TRANCHE.address, contractInfo.SENIOR_TRANCHE.ABI, provider);
      const seniorDisburseDetails = await seniorTrancheContract['calcDisburse(address)'](address);
      const juniorTrancheContract = new ethers.Contract(contractInfo.JUNIOR_TRANCHE.address, contractInfo.JUNIOR_TRANCHE.ABI, provider);
      const juniorDisburseDetails = await juniorTrancheContract['calcDisburse(address)'](address);
      setPendingSupply({
        Junior: juniorDisburseDetails.payoutTokenAmount,
        Senior: seniorDisburseDetails.payoutTokenAmount,
      });
      setCheckingPendingOrders(false);
    } catch (e) {
      console.error('failed to check pending supply orders: ', e);
    }
  }, [
    address,
    contractInfo?.JUNIOR_TRANCHE?.ABI,
    contractInfo?.JUNIOR_TRANCHE?.address,
    contractInfo?.SENIOR_TRANCHE?.ABI,
    contractInfo?.SENIOR_TRANCHE?.address,
    provider,
    whitelistStatus,
  ]);

  useEffect(() => {
    checkPendingSupplyOrders()
      .catch((e) => {
        console.error('failed to calculate withdrawal amount', e);
      });
  }, [checkPendingSupplyOrders]);

  const checkWhitelistAndOpenInvestPopup = useCallback(async (investFact: any) => {
  // const checkWhitelistAndOpenInvestPopup = async (investFact: any) => {
    if (provider && networkInfo && address && !['80001', '137'].includes(networkInfo.chainId?.toString())) {
      setSwitchNetworkOpen(true);
    }
    const timestampDiff = Date.now() / 1000 - whitelistStatusTimestamp
    if (!whitelistStatus) {
      let isMember: boolean = whitelistStatus;
      if (timestampDiff > 60) {
        if (!contractInfo || !networkInfo?.chainId || !address || !provider) {
          console.error(`error: something not found: contractInfo: ${
            contractInfo
          } | chainId: ${
            networkInfo?.chainId
          } | address: ${
            address
          } | provider: ${
            provider
          }`)
          return;
        }
        const memberContract = new Contract(
          contractInfo.JUNIOR_MEMBER_LIST.address,
          contractInfo.JUNIOR_MEMBER_LIST.ABI,
          provider
        );

        isMember = await memberContract.hasMember(address);
        if (networkInfo?.chainId === 80001) {
          const memberContract = new Contract(
            contractInfo.SENIOR_MEMBER_LIST.address,
            contractInfo.SENIOR_MEMBER_LIST.ABI,
            provider
          );

          const isSeniorMember = await memberContract.hasMember(address);
          isMember = isMember && isSeniorMember;
        }
        dispatch(updateWhitelistStatus(isMember));
      }
      if (!isMember) {
        dispatch(toggleKycModal());
        return;
      }
    }
    if (pendingSupply[investFact.tranche]?.gt(BigNumber.from(0))) {
      setWarningPendingSupply(investFact);
      return;
    }
    setInvestIn(investFact);
  // };
  }, [address, contractInfo, dispatch, networkInfo, pendingSupply, provider, whitelistStatus, whitelistStatusTimestamp])

  useEffect(() => {
    fetchPoolDetails()
      .catch((error) => {
        console.error('error while fetching pools: ', error);
        setApiCallStatus(false);
      });
  }, []);

  const wrongNetwork = provider && networkInfo && address && !['80001', '137'].includes(networkInfo.chainId?.toString())

  const apy = investIn?.APY?.map((apy: number) => (investAmount || 0) * (apy / 100));
  const apyDeduction = apy?.map((apyF: number) => apyF * 0.1);
  const insufficientBalance =
    Number(parseBalance(tokenBalance || 0, 2, contractInfo?.DAI_TOKEN?.TOKEN_DECIMALS)) < Number(investAmount);
  return (
    <>
      <SwitchNetworkModal close={() => setSwitchNetworkOpen(false)} open={switchNetworkOpen}/>
      <TableContainer component={Paper} className="table-container">
        <Table sx={{ minWidth: 650 }} aria-label="simple table" className="table">
          <TableHead className="table-head">
            <TableRow className="head-row">
              <TableCell className="head-cell">Token</TableCell>
              <TableCell className="head-cell">Name</TableCell>
              <TableCell className="head-cell">Tranche</TableCell>
              {/*<TableCell className="head-cell">Total Issuance</TableCell>*/}
              <TableCell className="head-cell">Expected APY</TableCell>
              <TableCell className="head-cell">Payment Frequency</TableCell>
              {/*<TableCell className="head-cell">Maturity</TableCell>*/}
              {/*<TableCell className="head-cell">LTV</TableCell>*/}
              {/*<TableCell className="head-cell">Leverage</TableCell>*/}
              <TableCell className="head-cell">Total Supplied</TableCell>
              <TableCell className="head-cell"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="table-body">
            {apiCallStatus ? <TableRow className="body-row">
              <TableCell colSpan={7}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <CircularProgress />
                </Box>
              </TableCell>
            </TableRow> : factList.map((row) => (
              <TableRow key={row.secId} sx={{ "&:last-child td, &:last-child th": { border: 0 } }} className="body-row">
                <TableCell component="th" scope="row">
                  {row.secId}
                </TableCell>
                <TableCell>{row.secName}</TableCell>
                <TableCell>{row.tranche}</TableCell>
                {/*<TableCell>{row.totalIssuance}</TableCell>*/}
                <TableCell>{row.apy}</TableCell>
                <TableCell>{row.frequency}</TableCell>
                {/*<TableCell>{row.maturity}</TableCell>*/}
                {/*<TableCell>{row.ltv}</TableCell>*/}
                {/*<TableCell>{row.leverage}</TableCell>*/}
                <TableCell>{row.current}</TableCell>
                <TableCell className="invest-button">
                  <button
                    className="invest"
                    onClick={() => checkWhitelistAndOpenInvestPopup(row)}
                    disabled={!address || checkingPendingOrders}
                    title={checkingPendingOrders ? 'checking for pending supply orders' : !address ? 'Please connect your wallet to enable invest' : ''}
                  >
                    Invest
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={Boolean(investIn?.secId) && !wrongNetwork}
        onClose={() => {
          setWarningPendingSupply(null);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="invest-modal">
          <Box className="header-img">
            <img src={Casten} alt="Casten Logo" className="casten-logo" />
          </Box>
          <Typography id="pending-supply-warning-title">
            Previous deposits are not supplied! Please complete your pending {warningPendingSupply?.tranche} claims.
          </Typography>
          <Box className="form-btns grid-2">
            <button
              onClick={() => {
                navigate('/portfolio');
              }}
              type="button"
            >
              Take me to My Portfolio
            </button>
            <button
              onClick={() => {
                setWarningPendingSupply(null);
              }}
              type="button"
              className="cancel"
            >
              Close
            </button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={Boolean(investIn?.secId) && !wrongNetwork}
        onClose={() => {
          if (approving || supplying) {
            return;
          }
          setInvestIn(null);
          clearAmounts();
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="invest-modal">
          {supplied ? <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Congratulations you&apos;ve successfully invested ${investAmount} in {investIn.tranche}.
            </Typography>
          </Box> : <>
            <Box className="header-img">
              <img src={Casten} alt="Casten Logo" className="casten-logo" />
            </Box>
            <Box className="form-block">
              <div className="label">USDC Balance</div>
              <div className="value-input">{parseBalance(tokenBalance || 0, 2, contractInfo?.DAI_TOKEN?.TOKEN_DECIMALS)} USDC</div>
              <div className="label">Deposit Amount</div>
              <div className="value-input">
                <TextField
                  id="outlined-basic"
                  label="$"
                  variant="outlined"
                  type="number"
                  className="form-input"
                  fullWidth
                  disabled={checkingAllowance || supplying || approving}
                  value={investAmount}
                  onChange={(e) => {
                    setInvestAmount(Number(e.target.value));
                    setInvestAmountError(BigNumber
                      .from(Number(e.target.value) || 0)
                      .mul(BigNumber.from(10).pow(18))
                      .lte(BigNumber.from(0)));
                  }}
                  error={investAmountError}
                  inputProps={{
                    className: 'input'
                  }}
                />
                {investAmountError && <div className="error">
                  <Typography id="invest-amount-error" variant="caption" component="span" color="red">
                    Please enter valid amount to invest
                  </Typography>
                </div>}
                {/*{!!investAmount && <Typography id="investment-apy" variant="caption" component="span">*/}
                {/*  you are depositing in {investIn?.tranche} tranche, which is has an estimated APY for {investIn?.apy}.*/}
                {/*  You will be eligible to withdraw&nbsp;*/}
                {/*  ${((currentInvestment[investIn?.tranche] || 0) + investAmount + (investAmount * (investIn?.APY / 100))).toFixed(2)}&nbsp;*/}
                {/*  if you stay deposited for 1 year*/}
                {/*</Typography>}*/}
              </div>
              <div className="label">{investIn?.tranche} Pool APY</div>
              <div className="value-input">{investIn?.apy}</div>
              <div className="label">Interest Payout Frequency</div>
              <div className="value-input">Monthly</div>
              <div className="label">Interest Payout Based on Frequency</div>
              <div className="value-input">
                {apy?.map((apy: number, i: number) => `$${((apy - apyDeduction[i]) / 12).toFixed(4)}`).join(' - ')}
              </div>
            </Box>
            {(
              checkingAllowance ||
              approving ||
              supplying
            ) && <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" mb={2}>
              <LinearProgress
                sx={{
                  height: '15px',
                  borderRadius: '4px',
                  width: '100%',
                }}
                color="primary"
                classes={{ colorPrimary: 'colorPrimary', barColorPrimary: 'barColorPrimary' }}
              />
              <Typography id="loader-text" variant="caption" component="span">
                {checkingAllowance && <span>
                  Checking approved amount of USDC to ${investIn?.tranche} Contract...&nbsp;
                </span>}
                {approving && `approving your USDC amount to spent by ${investIn?.tranche} Contract for invest...`}
                {supplying && `Creating supply order...`}
              </Typography>
            </Box>}
            {(
              approvalTxHash
            ) && <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography id="approval-tx-link" variant="caption" component="span">
                Approval Transaction
              </Typography>
              <a
                className="tx-link"
                href={scanTxLink(networkInfo?.chainId as number, approvalTxHash)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tx <img src={ArrowNE} alt="arrow-north-east"/>
              </a>
            </Box>}
            {supplyTxHash && <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography id="supply-tx-link" variant="caption" component="span">
                Supply Transaction
              </Typography>
              <a
                className="tx-link"
                href={scanTxLink(networkInfo?.chainId as number, supplyTxHash)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tx <img src={ArrowNE} alt="arrow-north-east"/>
              </a>
            </Box>}
            <Box className="form-btns">
              <button
                onClick={approveAmount}
                type="button"
                disabled={!investAmount || insufficientBalance || approving || !needApproval}
              >
                {insufficientBalance ? 'Insufficient Balance' : `Approve USDC for ${investIn?.tranche} Tranche Deposit`}
              </button>
              <button
                onClick={supplyOrder}
                type="button"
                disabled={supplying || insufficientBalance || approving || needApproval}
              >
                Deposit
              </button>
              <button
                onClick={() => {
                  setInvestIn(null);
                  clearAmounts();
                }}
                type="button"
                className="cancel"
                disabled={supplying || approving}
              >
                Cancel
              </button>
            </Box>
          </>}
        </Box>
      </Modal>
    </>
  );
}

export default FactList;
