import { Grid, Backdrop, Box, Fade, Button } from "@material-ui/core";
import assets from "./asset-mock";
import "./style.scss";
import { useEffect, useState } from "react";

export interface IAssetsheet {
    secId: string;
    secName: string;
    description: string;
    value: string;
    financedate: string;
    maturity: string;
    status: string;
}
export interface IProductIcon {
    [key: string]: string;
}
export interface IAssetIcons {
    [key: string]: string[];
}

function AssetListHeader() {
    return (
        <Grid container className="table-header-container">
            <Grid item className="table-header-item-mid">
                <span className="text">ID</span>
            </Grid>

            <Grid item className="table-header-item-mid">
                <span className="text">Name</span>
            </Grid>

            <Grid item className="table-header-item-mid">
                <span className="text">Description</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Value</span>
            </Grid>
            <Grid item className="table-header-item-mid">
                <span className="text">Finance Date</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Maturity</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Status</span>
            </Grid>
        </Grid>
    );
}

function AssetList() {
    const [mwiAssets, setMwiAssets] = useState<string[]>([]);
    const [bniiAssets, setBniAssets] = useState<string[]>([]);
    const [lrcAssets, setLrcAssets] = useState<string[]>([]);

    return (
        <div className="product-container">
            <AssetListHeader />

            <div className="product-container-rows">
                {assets.map((p, index: number) => {
                    return (
                        <div className="product-row">
                            <Grid container className="product-row-container">
                                <Grid item className="table-value-item-mid">
                                    <span className="text">{p.secId}</span>
                                </Grid>

                                <Grid item className="table-value-item-mid">
                                    <span className="text">{p.secName}</span>
                                </Grid>
                                <Grid item className="table-value-item-mid">
                                    <span className="text">{p.description}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.value}</span>
                                </Grid>
                                <Grid item className="table-value-item-mid">
                                    <span className="text">{p.financedate}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.maturity}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.status}</span>
                                </Grid>
                            </Grid>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AssetList;
