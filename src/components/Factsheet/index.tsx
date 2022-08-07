import { Grid, Backdrop, Box, Fade, Button } from "@material-ui/core";
import facts from "./fact-mock";
import "./style.scss";
import { useEffect, useState } from "react";

export interface IFactsheet {
    secId: string;
    secName: string;
    tranche: string;
    totalIssuance: string;
    apy: string;
    frequency: string;
    maturity: string;
    ltv: string;
    leverage: string;
}
export interface IProductIcon {
    [key: string]: string;
}
export interface IAssetIcons {
    [key: string]: string[];
}

function FactListHeader() {
    return (
        <Grid container className="table-header-container">
            <Grid item className="table-header-item-mid">
                <span className="text">ID</span>
            </Grid>

            <Grid item className="table-header-item-mid">
                <span className="text">Name</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Tranche</span>
            </Grid>

            <Grid item className="table-header-item-mid">
                <span className="text">Total Issuance</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">APY</span>
            </Grid>
            <Grid item className="table-header-item-mid">
                <span className="text">Frequency</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Maturity</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">LTV</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Leverage</span>
            </Grid>
            <Grid item className="table-header-item"></Grid>
        </Grid>
    );
}

function FactList() {
    const [mwiAssets, setMwiAssets] = useState<string[]>([]);
    const [bniiAssets, setBniAssets] = useState<string[]>([]);
    const [lrcAssets, setLrcAssets] = useState<string[]>([]);

    return (
        <div className="product-container">
            <FactListHeader />

            <div className="product-container-rows">
                {facts.map((p, index: number) => {
                    return (
                        <div className="product-row">
                            <Grid container className="product-row-container">
                                <Grid item className="table-value-item-mid">
                                    <span className="text">{p.secId}</span>
                                </Grid>

                                <Grid item className="table-value-item-mid">
                                    <span className="text">{p.secName}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.tranche}</span>
                                </Grid>
                                <Grid item className="table-value-item-mid">
                                    <span className="text">{p.totalIssuance}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.apy}</span>
                                </Grid>
                                <Grid item className="table-value-item-mid">
                                    <span className="text">{p.frequency}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.maturity}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.ltv}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.leverage}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="button-text">Invest</span>
                                </Grid>
                            </Grid>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default FactList;
