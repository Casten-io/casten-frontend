import { Box, Modal, Paper, Grid, SvgIcon, IconButton, FormControl, OutlinedInput, InputLabel, InputAdornment } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "./mintActionModal.scss";
import DownArrow from "../../assets/icons/downarrow.png";
import { IReduxState } from "../../store/slices/state.interface";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import CircularProgress from "@material-ui/core/CircularProgress";
import CheckIcon from "../../assets/icons/check.svg";
import { getAddresses } from "src/constants/addresses";
import BiconomySave from "src/components/BiconomySave/BiconomySave";

interface IMintActionModalProps {
    open: boolean;
    transactionInProgress: boolean;
    title: string;
    value: string;
    description: React.ReactElement;
    buttonText: string;
    token: string;
    mintTo: string;
    completed: boolean;
    handleClose: () => void;
    onClick: () => void;
    savedAmount?: string;
    mintTx: string;
}

function MintActionModal({
    open,
    title,
    value,
    description,
    buttonText,
    completed,
    handleClose,
    onClick,
    token,
    mintTo,
    mintTx,
    transactionInProgress,
    savedAmount,
}: IMintActionModalProps) {
    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const openInExplorer = () => {
        window.open(`https://rinkeby.etherscan.io/tx/${mintTx}`, "__blank");
    };

    const addTokenToMetaMask = () => {
        const Addresses = getAddresses(4); // make this dynamic

        window.ethereum.request({
            method: "wallet_watchAsset",
            params: {
                type: "ERC20", // Initially only supports ERC20, but eventually more!
                options: {
                    address: Addresses.USM_ADDREESS, // The address that the token is at.
                    symbol: "USM", // A ticker symbol or shorthand, up to 5 chars.
                    decimals: 18, // The number of decimals in the token
                },
            },
        });
    };

    const happyHour = useSelector<IReduxState, boolean>(state => {
        return state.biconomy.happyHour;
    });

    return (
        <Modal id="mint-action-modal" open={open} onClose={handleClose}>
            <Paper className="ohm-card ohm-popover">
                <div className="cross-wrap">
                    <div onClick={handleClose} className="cancel-setting" />
                </div>

                <div className="mint-action-modal__header">
                    <p className="mint-action-modal__title">{title}</p>
                </div>

                <div className="mint-action-modal__content">
                    <div className="mint-action-modal__value">
                        <span id="number">{value}</span>&nbsp;
                        <span id="unit">{token}</span>
                    </div>

                    <div className="mint-action-modal__arrow">
                        <img src={DownArrow} alt="Down Arrow" />
                    </div>
                    <div className="mint-action-modal__value">
                        <span id="number">{value}</span>&nbsp;
                        <span id="unit">{mintTo}</span>
                    </div>
                </div>

                {happyHour && savedAmount && <BiconomySave amount={savedAmount} />}

                {description && <div className="mint-action-modal__description">{description}</div>}

                {!completed && (
                    <div className="action-button-wrapper">
                        <div className="action-button" onClick={onClick}>
                            {pendingTransactions.length > 0 || transactionInProgress ? (
                                <div className="connect-button-progress">
                                    <CircularProgress size={15} color="primary" />
                                </div>
                            ) : completed ? (
                                <img src={CheckIcon} alt="Check" />
                            ) : (
                                <p>{buttonText}</p>
                            )}
                        </div>
                    </div>
                )}

                {completed && (
                    <div className="action-button-wrapper">
                        <div className="completed-action-button" onClick={addTokenToMetaMask}>
                            Add Token To Metamask
                        </div>
                    </div>
                )}

                {completed && (
                    <div className="action-button-wrapper">
                        <div className="completed-action-button" onClick={openInExplorer}>
                            View On Etherscan
                        </div>
                    </div>
                )}
            </Paper>
        </Modal>
    );
}

export default MintActionModal;
