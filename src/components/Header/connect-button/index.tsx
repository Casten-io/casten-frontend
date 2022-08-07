import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWeb3Context } from "../../../hooks";
import { DEFAULT_NETWORK } from "../../../constants";
import { IReduxState } from "../../../store/slices/state.interface";
import { IPendingTxn } from "../../../store/slices/pending-txns-slice";
import "./connect-menu.scss";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import Metamask from "../../../assets/icons/metamask.jpeg";
import CircularProgress from "@material-ui/core/CircularProgress";

function ConnectMenu() {
    const { connect, disconnect, connected, address, web3, providerChainID, checkWrongNetwork } = useWeb3Context();
    const dispatch = useDispatch();
    const [isConnected, setConnected] = useState(connected);

    let pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    let buttonText = "Connect Wallet";
    let clickFunc: any = connect;
    let buttonStyle = {};

    if (isConnected) {
        buttonText = address.substring(0, 7) + "..." + address.substring(address.length - 5);
        clickFunc = disconnect;
    }

    if (isConnected && providerChainID !== DEFAULT_NETWORK) {
        buttonText = "Wrong network";
        buttonStyle = { backgroundColor: "rgb(255, 67, 67)" };
        clickFunc = () => {
            checkWrongNetwork();
        };
    }

    useEffect(() => {
        setConnected(connected);
    }, [web3, connected]);

    return (
        <div className="topbar-right">
            {isConnected && (
                <div className="portfolio-container">
                    <Typography className="portfolio-button">Portfolio Manager</Typography>
                </div>
            )}
            <div className="connect-button" style={buttonStyle} onClick={clickFunc}>
                <img src={Metamask} className="metamask-icon" />
                <p>{buttonText}</p>
                {/* {pendingTransactions.length > 0 && (
                <div className="connect-button-progress">
                    <CircularProgress size={15} color="inherit" />
                </div>
            )} */}
            </div>
        </div>
    );
}

export default ConnectMenu;
