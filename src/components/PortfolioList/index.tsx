import { Grid, Backdrop, Box, Fade, Button } from "@material-ui/core";
import portfolio from "./portfolio-mock";
import "./style.scss";
import { useEffect, useCallback, useState } from "react";
import { useHistory } from "react-router-dom";

export interface IPortfoliosheet {
    select: string;
    symbol: string;
    sec_name: string;
    issuer: string;
    apy: string;
    maturity: string;
    tranche: string;
    frequency: string;
    price: string;
    profitloss: string;
    invested: string;
    exposure: string;
    percent_exp: string;
}
export interface IProductIcon {
    [key: string]: string;
}
export interface IAssetIcons {
    [key: string]: string[];
}

function PortfolioListHeader() {
    return (
        <Grid container className="table-header-container">
            <Grid item className="table-header-item">
                <span className="text">Select</span>
            </Grid>

            <Grid item className="table-header-item">
                <span className="text">Symbol</span>
            </Grid>

            <Grid item className="table-header-item">
                <span className="text">Sec Name</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Issuer</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">APY</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Maturity</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Tranche</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Frequency</span>
            </Grid>

            <Grid item className="table-header-item">
                <span className="text">Price</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">P/L</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Amt Invested</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Exposure</span>
            </Grid>
            <Grid item className="table-header-item">
                <span className="text">Exposure %</span>
            </Grid>
        </Grid>
    );
}

function PortfolioList() {
    const [mwiAssets, setMwiAssets] = useState<string[]>([]);
    const [bniiAssets, setBniAssets] = useState<string[]>([]);
    const [lrcAssets, setLrcAssets] = useState<string[]>([]);
    const history = useHistory();

    const securityRedirect = useCallback(() => history.push("/security"), [history]);

    return (
        <div className="product-container">
            <PortfolioListHeader />

            <div
                className="product-container-rows"
                onClick={() => {
                    securityRedirect;
                }}
            >
                {portfolio.map((p, index: number) => {
                    return (
                        <div className="product-row">
                            <Grid container className="product-row-container">
                                <Grid item className="table-value-item">
                                    <span className="text">{p.select}</span>
                                </Grid>

                                <Grid item className="table-value-item">
                                    <span className="text">{p.symbol}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.sec_name}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.issuer}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.apy}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.maturity}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.tranche}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.frequency}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.price}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.profitloss}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.invested}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.exposure}</span>
                                </Grid>
                                <Grid item className="table-value-item">
                                    <span className="text">{p.percent_exp}</span>
                                </Grid>
                            </Grid>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PortfolioList;
