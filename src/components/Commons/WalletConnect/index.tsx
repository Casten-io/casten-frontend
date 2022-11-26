import { BigNumber, providers } from "ethers";
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { updateExecution, walletConnect } from "../../../store/slices/account";
import { RootState } from "../../../store";
import "./style.scss";
import Metamask from "../../../assets/icons/metamask.jpeg";
import { backendUrl, CHAIN_INFO, Networks } from '../../../constants';
import { toHexTrimZero } from '../../../helpers/switch-network';
import { AngleRightCircleIcon } from '../../Drawer/drawer-content/icons';
import QuestionMarkCircleSolidIcon from '../../Drawer/drawer-content/icons/QuestionMarkCIrcleSolidIcon';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 3,
  p: 4,
};

function WalletConnect() {
  const [web3Modal, setWeb3Modal] = useState<null | Web3Modal>(null);
  const [wrongNetwork, setWrongNetwork] = useState<boolean>(false)
  const [showSwitchNetworkModal, setShowSwitchNetworkModal] = useState<boolean>(false)
  const dispatch = useDispatch();
  const address = useSelector((state: RootState) => state.account.address);
  const stateProvider = useSelector((state: RootState) => state.account.provider);
  const stateNetworkInfo = useSelector((state: RootState) => state.account.networkInfo);

  useEffect(() => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "",
        },
      },
    };

    const newWeb3Modal = new Web3Modal({
      cacheProvider: true, // very important
      network: "mainnet",
      providerOptions,
    });

    setWeb3Modal(newWeb3Modal);
  }, []);

  useEffect(() => {
    if (stateProvider && stateNetworkInfo && address && !['80001', '137'].includes(stateNetworkInfo.chainId?.toString())) {
      setWrongNetwork(true)
    } else {
      setWrongNetwork(false)
    }
  }, [stateNetworkInfo, address, stateProvider])

  const executeQuery = (User: string) => {
    fetch(`${backendUrl}/dune/execute/1620692`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ User })
    })
      .then((resp) => resp.json())
      .then((respJson) => dispatch(updateExecution({
        executionId: respJson.data.execution_id,
      })))
      .catch((error) => {
        console.error('query execution failed: ', error)
      })
  }

  function subscribeProvider(provider: any) {
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
    });

    // Subscribe to chainId change
    provider.on("chainChanged", async (chainId: number) => {
      console.log('chain changed', chainId);
      try {
        const ethersProvider = new providers.Web3Provider(provider);
        const network = await ethersProvider.getNetwork();
        const userAddress = await ethersProvider.getSigner().getAddress();
        dispatch(
          walletConnect({
            provider: ethersProvider,
            address: userAddress,
            networkInfo: network
          })
        );
      } catch (e) {
        console.error('error in network info read after chain change: ', e)
      }
    });

    // Subscribe to provider connection
    provider.on("connect", (info: { chainId: number }) => {
      console.log(info);
    });

    // Subscribe to provider disconnection
    provider.on("disconnect", (error: { code: number; message: string }) => {
      console.log(error);
    });
  }

  async function connectWallet() {
    if (!web3Modal) {
      return;
    }
    const provider = await web3Modal.connect();
    const ethersProvider = new providers.Web3Provider(provider);
    const network = await ethersProvider.getNetwork();
    const userAddress = await ethersProvider.getSigner().getAddress();
    subscribeProvider(provider)
    dispatch(
      walletConnect({
        provider: ethersProvider,
        address: userAddress,
        networkInfo: network
      })
    );
    executeQuery(userAddress)
  }

  const switchNetwork = async () => {
    try {
      if (stateProvider && stateNetworkInfo && address && !Object.values(Networks).includes(stateNetworkInfo.chainId?.toString())) {
        await stateProvider.send('wallet_switchEthereumChain', [
          { chainId: toHexTrimZero(Networks.PolyMain) },
        ]);
        setShowSwitchNetworkModal(false);
      }
    } catch (e) {
      console.log(e);
    }
  }

  if (wrongNetwork && address) {
    return (
      <>
        {stateNetworkInfo && <Modal
          open={showSwitchNetworkModal}
          onClose={() => setShowSwitchNetworkModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Box
              display="flex"
              justifyContent="space-between"
            >
              <Box pl={2} display="flex" flexDirection="column" alignItems="center" py={3}>
                <Box width="50px" height="50px" mb={2}>
                  {(
                    CHAIN_INFO[stateNetworkInfo.chainId.toString()] &&
                    <img src={CHAIN_INFO[stateNetworkInfo.chainId.toString()].logo} width="50px" alt="chain-logo"/>
                  ) || <QuestionMarkCircleSolidIcon fill="#5f5f5f" size="50"/>}
                </Box>
                <Typography fontWeight="normal" textTransform="capitalize">
                  {CHAIN_INFO[stateNetworkInfo.chainId.toString()]?.name || stateNetworkInfo?.name}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="center" width="20">
                <AngleRightCircleIcon size="20" fill="#909090"/>
              </Box>
              <Box pr={2} display="flex" flexDirection="column" alignItems="center" py={3}>
                <Box width="50px" height="50px" mb={2}>
                  <img src={CHAIN_INFO[Networks.PolyMain.toString()].logo} width="50px" alt="chain-logo"/>
                </Box>
                <Typography fontWeight="normal" textTransform="capitalize">
                  {CHAIN_INFO[Networks.PolyMain.toString()].name}
                </Typography>
              </Box>
            </Box>
            <Typography mb={3} textAlign="center">
              Switching network to {CHAIN_INFO[Networks.PolyMain.toString()].name} from&nbsp;
              {CHAIN_INFO[stateNetworkInfo.chainId.toString()]?.name || stateNetworkInfo?.name}
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Button onClick={() => setShowSwitchNetworkModal(false)} variant="outlined" color="warning">
                Cancel
              </Button>
              <Button onClick={switchNetwork} variant="outlined" color="info">
                Switch
              </Button>
            </Box>
          </Box>
        </Modal>}
        <Button
          variant="outlined"
          color="error"
          className="wallet-connect"
          onClick={() => setShowSwitchNetworkModal(true)}
        >
          Switch Network
        </Button>
      </>
    );
  }
  return (
    <div className="wallet-connect" onClick={connectWallet}>
      {!address && <p className="wallet-text">Connect Wallet</p>}
      {!wrongNetwork && address && (
        <div className="connected-items">
          <img src={Metamask} className="metamask" />
          <p className="address">
            {address.substring(0, 5) +
              "..." +
              address.substring(address.length - 5)}
          </p>
        </div>
      )}
    </div>
  );
}

export default WalletConnect;
