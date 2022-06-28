import { Modal, Paper } from "@material-ui/core";
import { useSelector } from "react-redux";
import "./stakingActionModal.scss";

import { IReduxState } from "../../store/slices/state.interface";
import { IPendingTxn } from "../../store/slices/pending-txns-slice";
import CircularProgress from "@material-ui/core/CircularProgress";
import CheckIcon from "../../assets/icons/check.svg";
import BiconomySave from "src/components/BiconomySave/BiconomySave";
import { getAddresses } from "src/constants/addresses";

interface IStakingActionModalProps {
    open: boolean;
    transactionInProgress : boolean;
    title: string;
    value: string;
    description: React.ReactElement;
    buttonText: string;
    token: string;
    completed: boolean;
    savedAmount?: string;
    handleClose: () => void;
    onClick: () => void;
    event: string;
    stakingTx: string;
    unstakingData?: {
        penalty: string;
        amount: string;
    }
}

function StakingActionModal({ open, title, value, description, buttonText, completed, handleClose, event, onClick, token, stakingTx, transactionInProgress, savedAmount }: IStakingActionModalProps) {
    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });
    const happyHour = useSelector<IReduxState, boolean>(state => {
        return state.biconomy.happyHour;
    }) 

    const openInExplorer = () => {
        window.open(`https://rinkeby.etherscan.io/tx/${stakingTx}`, "__blank")
    }

    const addTokenToMetaMask = () => {
        const Addresses = getAddresses(4); // make this dynamic
        window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20', // Initially only supports ERC20, but eventually more!
                options: {
                    address: Addresses.GD33D_ADDRESS, // The address that the token is at.
                    symbol: 'vD33D', // A ticker symbol or shorthand, up to 5 chars.
                    decimals: 18, // The number of decimals in the token
                },
            },
        });
    }
    return (
        <Modal id="staking-action-modal" open={open} onClose={handleClose}>
            <Paper className="ohm-card ohm-popover">
                <div className="cross-wrap">
                    <div onClick={handleClose} className="cancel-setting" />
                </div>

                <div className="staking-action-modal__header">
                    <p className="staking-action-modal__title">{title}</p>
                </div>

                <div className="staking-action-modal__content">
                    <div className="staking-action-modal__label">Total {event} Amount</div>
                    <div className="staking-action-modal__value">
                        <span id="number">{value}</span>&nbsp;
                        <span id="unit">{token}</span>
                    </div>
                    {event === "Receiving" && <hr/>}
                    {event === "Receiving" && false && <div className="staking-action-modal_display-flex-column">
                        <div className="staking-action-modal_display-flex-row">
                            <div className="staking-action-modal_display-width-50 staking-action-modal__label">
                                Unstake Amount
                            </div>
                            <div className="staking-action-modal_display-width-50  staking-action-modal__label staking-action-modal_display-align-right">
                                {token}
                            </div>
                        </div>
                        <div className="staking-action-modal_display-flex-row">
                            <div className="staking-action-modal_display-width-50 staking-action-modal__label">
                                Unstake Penalty
                            </div>
                            <div className="staking-action-modal_display-width-50  staking-action-modal__label staking-action-modal_display-align-right">
                                %
                            </div>
                        </div>
                    </div>}
                </div>

                {happyHour&&savedAmount&&["stake","redeem"].includes(event.toLowerCase())&&<div className="biconomy">
                    <BiconomySave amount={savedAmount}/>
                </div>}

                {description && (event !== "Stake" || !completed) &&  (
                    <div className="staking-action-modal__description">
                        {description}
                    </div>
                )}

                { (event !== "Stake" || !completed) && <div className="action-button-wrapper">
                    <div className="action-button" onClick={onClick} >
                    {
                        (pendingTransactions.length > 0 || transactionInProgress) ? (
                            <div className="connect-button-progress">
                                <CircularProgress size={15} color="primary" />
                            </div>
                        ) : (
                            completed ? 
                                (<img src={CheckIcon} alt="Check" />) :
                                <p>{buttonText}</p>
                        )
                    }
                    </div>
                </div>}


                { completed && event === "Stake"  && <div className="action-button-wrapper">
                    <div className="completed-action-button" onClick={addTokenToMetaMask}>
                        Add Token To Metamask
                    </div>
                </div>}

                { completed && event === "Stake" && <div className="action-button-wrapper">
                    <div className="completed-action-button" onClick={openInExplorer}>
                        View On Etherscan
                    </div>
                </div>}
            </Paper>
        </Modal>
    )
}

export default StakingActionModal;
