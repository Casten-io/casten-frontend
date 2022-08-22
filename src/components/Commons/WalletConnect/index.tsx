import {  providers } from "ethers";
import { useState, useEffect} from "react";
import { useSelector, useDispatch } from 'react-redux'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider';
import {
    walletConnect
} from '../../../store/slices/account';
import {RootState} from '../../../store';

function WalletConnect() {

    const [web3Modal, setWeb3Modal] = useState<null | Web3Modal>(null);
    const dispatch = useDispatch();
    const address = useSelector((state: RootState) => state.account.address)


    useEffect(() => {
        const providerOptions = {
            walletconnect: {
                package: WalletConnectProvider,
                options: {
                    infuraId: "",
                }
            },
        };

        const newWeb3Modal = new Web3Modal({
            cacheProvider: true, // very important
            network: "mainnet",
            providerOptions,
        });

        setWeb3Modal(newWeb3Modal)
    }, []);

    async function connectWallet() {
        if(!web3Modal) {
            return;
        }
        const provider = await web3Modal.connect();
        const ethersProvider = new providers.Web3Provider(provider)
        const userAddress = await ethersProvider.getSigner().getAddress()
        dispatch(walletConnect({
            provider,
            address: userAddress
        }))
    }

    return  (
        <div>
            <button onClick={connectWallet}>Connect wallet</button>
            <p>{address}</p>
        </div>
    )

}

export default WalletConnect;