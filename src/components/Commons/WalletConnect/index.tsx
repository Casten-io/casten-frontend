import { providers } from "ethers";
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { Button } from '@mui/material';
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { walletConnect, disconnect } from "../../../store/slices/account";
import { RootState } from "../../../store";
import LogoutIcon from '../../../assets/icons/logout.svg'
import "./style.scss";
import { infuraId } from '../../../constants';
import SwitchNetworkModal from './SwitchNetworkModal';
import { useWallet } from '../../../contexts/WalletContext';

function WalletConnect() {
  const [web3Modal, setWeb3Modal] = useState<null | Web3Modal>(null);
  const [wrongNetwork, setWrongNetwork] = useState<boolean>(false)
  const [showSwitchNetworkModal, setShowSwitchNetworkModal] = useState<boolean>(false)
  const dispatch = useDispatch();
  const { provider: stateProvider, setProvider } = useWallet();
  const isWalletConnected = useSelector((state: RootState) => state.account.isWalletConnected);
  const address = useSelector((state: RootState) => state.account.address);
  // const stateProvider = useSelector((state: RootState) => state.account.provider);
  const stateNetworkInfo = useSelector((state: RootState) => state.account.networkInfo);

  useEffect(() => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId,
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
      setWrongNetwork(true);
    } else {
      setWrongNetwork(false);
    }
  }, [stateNetworkInfo, address, stateProvider]);

  function subscribeProvider(provider: any) {
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
      dispatch(walletConnect({ address: accounts[0] }));
    });

    // Subscribe to chainId change
    provider.on("chainChanged", async (chainId: number) => {
      console.log('chain changed', chainId);
      try {
        const ethersProvider = new providers.Web3Provider(provider);
        const network = await ethersProvider.getNetwork();
        const userAddress = await ethersProvider.getSigner().getAddress();
        setProvider(ethersProvider);
        dispatch(walletConnect({
          address: userAddress,
          networkInfo: network
        }));
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
      dispatch(disconnect());
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
    subscribeProvider(provider);
    setProvider(ethersProvider);
    dispatch(
      walletConnect({
        address: userAddress,
        networkInfo: network
      })
    );
  }

  useEffect(() => {
    if (web3Modal && !address && isWalletConnected) {
      console.log('connecting')
      connectWallet()
        .catch((err) => console.error('error while reconnecting: ', err));
    }
  }, [address, isWalletConnected, web3Modal])

  if (wrongNetwork && address) {
    return (
      <>
        <SwitchNetworkModal
          open={showSwitchNetworkModal}
          close={() => setShowSwitchNetworkModal(false)}
        />
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
    <>
      <div className={`wallet-connect${address ? ' connected' : ''}`} onClick={connectWallet}>
        {!address && <p className="wallet-text">Connect Wallet</p>}
        {!wrongNetwork && address && (
          <div className="connected-items">
            <div className="metamask">
              <Jazzicon
                diameter={20}
                seed={jsNumberForAddress(address)}
              />
            </div>
            <p className="address">
              {address.substring(0, 5) +
                "..." +
                address.substring(address.length - 5)}
            </p>
          </div>
        )}
      </div>
      {!wrongNetwork && address && <div className="wallet-connect connected disconnect" onClick={() => dispatch(disconnect())}>
        <div className="connected-items">
          <img src={LogoutIcon} style={{width: 20, height: 20}} alt="logout" />
        </div>
      </div>}
    </>
  );
}

export default WalletConnect;
