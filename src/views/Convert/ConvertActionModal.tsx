import { Box, Modal, Paper, Grid, SvgIcon, IconButton, FormControl, OutlinedInput, InputLabel, InputAdornment } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "./convertActionModal.scss";
import DownArrow from "../../assets/icons/downarrow.png";
import { IReduxState } from "../../store/slices/state.interface";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../store/slices/pending-txns-slice";
import CircularProgress from "@material-ui/core/CircularProgress";
import CheckIcon from "../../assets/icons/check.svg";
import BiconomySave from "src/components/BiconomySave/BiconomySave";
import { getAddresses } from "src/constants/addresses";

interface IConvertActionModalProps {
    open: boolean;
    transactionInProgress: boolean;
    title: string;
    value: string;
    description: React.ReactElement;
    buttonText: string;
    token: string;
    convertTo: string;
    completed: boolean;
    handleClose: () => void;
    onClick: () => void;
    savedAmount?: string;
    convertTx: string;
}

function ConvertActionModal({
    open,
    title,
    value,
    description,
    buttonText,
    completed,
    handleClose,
    onClick,
    token,
    convertTo,
    convertTx,
    transactionInProgress,
    savedAmount,
}: IConvertActionModalProps) {
    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const openInExplorer = () => {
        window.open(`https://rinkeby.etherscan.io/tx/${convertTx}`, "__blank");
    };

    const happyHour = useSelector<IReduxState, boolean>(state => {
        return state.biconomy.happyHour;
    });

    const addTokenToMetaMask = () => {
        const Addresses = getAddresses(4); // make this dynamic

        if (convertTo === "vD33D") {
            window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20", // Initially only supports ERC20, but eventually more!
                    options: {
                        address: Addresses.GD33D_ADDRESS, // The address that the token is at.
                        symbol: "vD33D", // A ticker symbol or shorthand, up to 5 chars.
                        decimals: 18, // The number of decimals in the token
                    },
                },
            });
        } else {
            window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20", // Initially only supports ERC20, but eventually more!
                    options: {
                        address: Addresses.D33D_ADDRESS, // The address that the token is at.
                        symbol: "D33D", // A ticker symbol or shorthand, up to 5 chars.
                        decimals: 18, // The number of decimals in the token
                    },
                },
            });
        }
    };

    return (
        <Modal id="convert-action-modal" open={open} onClose={handleClose}>
            <Paper className="ohm-card ohm-popover">
                <div className="cross-wrap">
                    <div onClick={handleClose} className="cancel-setting" />
                </div>

                <div className="convert-action-modal__header">
                    <p className="convert-action-modal__title">{title}</p>
                </div>

                <div className="convert-action-modal__content">
                    <div className="convert-action-modal__value">
                        <span id="number">{value}</span>&nbsp;
                        <span id="unit">{token}</span>
                    </div>
                    <div className="convert-action-modal__sub-value">
                        <span id="number">+{String(Number(value) / 10)}</span>&nbsp;
                        <span id="unit">USDC</span>
                    </div>
                    <div className="convert-action-modal__arrow">
                        <img src={DownArrow} alt="Down Arrow" />
                    </div>
                    <div className="convert-action-modal__value">
                        <span id="number">{value}</span>&nbsp;
                        <span id="unit">{convertTo}</span>
                    </div>
                </div>

                {happyHour && savedAmount && (
                    <div className="biconomy">
                        <BiconomySave amount={savedAmount} />
                    </div>
                )}

                {(pendingTransactions.length > 0 || transactionInProgress) && <div className="convert-action-modal__description">{description}</div>}

                {description && <div className="convert-action-modal__description">{description}</div>}

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
                                <span>{buttonText}</span>
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

export default ConvertActionModal;
