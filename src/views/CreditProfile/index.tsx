import { useState, useEffect } from "react";
import "./security.scss";
import { Grid, InputAdornment, OutlinedInput, Backdrop, Zoom, Slider, Fade, Box, Typography } from "@material-ui/core";
import FactList from "src/components/Factsheet";
import AssetList from "src/components/AssetList";

function CreditProfile() {
    return (
        <div className="credit-view">
            <Zoom in={true}>
                <>
                    <div className="header-container">
                        <Typography className="title">Credit and Financial Profile</Typography>
                    </div>
                    <div className="content-container">
                        <div className="content-header">
                            <Typography className="title">Overview</Typography>
                            <Typography className="title">Asset Quality</Typography>
                            <Typography className="title">Yield Analysis</Typography>
                        </div>
                    </div>

                    <div className="content-details"></div>
                </>
            </Zoom>
        </div>
    );
}

export default CreditProfile;
