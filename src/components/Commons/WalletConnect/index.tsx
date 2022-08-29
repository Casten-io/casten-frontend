import { providers } from "ethers";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { walletConnect } from "../../../store/slices/account";
import { RootState } from "../../../store";
import "./style.scss";
import Metamask from "../../../assets/icons/metamask.jpeg";

function WalletConnect() {
  const [web3Modal, setWeb3Modal] = useState<null | Web3Modal>(null);
  const dispatch = useDispatch();
  const address = useSelector((state: RootState) => state.account.address);

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

  async function connectWallet() {
    if (!web3Modal) {
      return;
    }
    const provider = await web3Modal.connect();
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
  }

  return (
    <div className="wallet-connect" onClick={connectWallet}>
      {!address && <p className="wallet-text">Connect Wallet</p>}
      {address && (
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
