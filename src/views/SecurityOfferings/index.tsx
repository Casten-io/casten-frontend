import { useState, useEffect } from "react";
import "./security.scss";
import { Grid, InputAdornment, OutlinedInput, Backdrop, Zoom, Slider, Fade, Box, Typography } from "@material-ui/core";
import FactList from "src/components/Factsheet";
import AssetList from "src/components/AssetList";

function Security() {
    return (
        <div className="security-view">
            <Zoom in={true}>
                <>
                    <div className="header-container">
                        <Typography className="title">Security Details</Typography>
                        <Typography className="subtitle">Series A1</Typography>
                    </div>
                    <div className="content-container">
                        <div className="factsheet-container">
                            <Typography className="factsheet">Factsheet</Typography>
                            <FactList />
                        </div>
                        <div className="assetlist-container">
                            <Typography className="assetlist">Asset List</Typography>
                            <AssetList />
                        </div>
                    </div>
                </>
            </Zoom>
        </div>
    );
}

export default Security;
