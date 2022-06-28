import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useWeb3Context } from "../../hooks";
import { Grid, InputAdornment, OutlinedInput, Backdrop, Zoom, Slider, Fade, Box } from "@material-ui/core";
import { IReduxState } from "../../store/slices/state.interface";
import { trim } from "../../helpers";
import { Skeleton } from "@material-ui/lab";
import USMIcon from "../../assets/icons/$USM.png";
import DVD from "../../assets/icons/DVD.svg";
import D33D from "../../assets/icons/metapoly-home.svg";
import "./lend.scss";
import { IPendingTxn, isPendingTxn, txnButtonText, getPendingTransInfo } from "../../store/slices/pending-txns-slice";
import classnames from "classnames";
import { IBiconomySlice } from "src/store/slices/biconomy-slice";
import useGasFee from "src/hooks/biconomy/useGasFee";
import useBiconomy from "src/hooks/biconomy/useBiconomy";
import HappyHourTag from "src/components/HappyHourTag/HappyHourTag";
import { warning } from "../../store/slices/messages-slice";
import { getAddresses } from "../../constants";
import DownArrow from "../../assets/icons/Arrow-Down.png";
import UpArrow from "../../assets/icons/Arrow-Up.png";
import Typography from "@material-ui/core/Typography";

function Dropdown() {
    return (
        <div className="dropdown-container">
            <div className="dropdown-container-row">
                <Typography></Typography>
                <Typography></Typography>
            </div>
        </div>
    );
}

export default Dropdown;
