import { Grid, Backdrop, Box, Fade, Button } from "@material-ui/core";
import products from "./product-mock";
import "./style.scss";
import { useEffect, useState } from "react";

export interface IProduct {
    productIcon: string;
    productName: string;
    assetIcon: string;
    liquidity: number;
    roi: number;
}
export interface IProductIcon {
    [key: string]: string;
}
export interface IAssetIcons {
    [key: string]: string[];
}

function ProductListHeader() {
    return (
        <Grid container className="table-header-container">
            <Grid item xs={4} className="table-header-item">
                <span className="text-special">Name of Strategy</span>
            </Grid>

            <Grid item xs={3} className="table-header-item">
                <span className="text">Assets</span>
            </Grid>

            {/* <Grid item xs={2} className="table-header-item">
        <span className="text">Liquidity</span>
      </Grid> */}

            <Grid item xs={2} className="table-header-item">
                <span className="text">ROI</span>
            </Grid>
            <Grid item xs={3} className="table-header-item">
                <span className="text"></span>
            </Grid>
        </Grid>
    );
}

function ProductList() {
    const [mwiAssets, setMwiAssets] = useState<string[]>([]);
    const [bniiAssets, setBniAssets] = useState<string[]>([]);
    const [lrcAssets, setLrcAssets] = useState<string[]>([]);

    return (
        <div className="product-container">
            <ProductListHeader />

            <div className="product-container-rows">
                {products.map((p, index: number) => {
                    return (
                        <div className="product-row">
                            <Grid container className="product-row-container">
                                <Grid item xs={4} className="product-row-container-element">
                                    {/* <img src={productIcon[p.name]} alt={index.toString()} className="product-icon" /> */}
                                    <span style={{ marginLeft: "4px" }} className="text">
                                        {p.productName}
                                    </span>
                                </Grid>

                                <Grid item xs={3} className="product-row-container-element">
                                    {/* {p.productName === "Market Weight Index" ? (
                                        <div className="icon-container">
                                            <img src={WBTCIcon} className="icon" />
                                            <img src={WETHIcon} className="icon" />
                                            <img src={USDTIcon} className="icon" />
                                            <img src={WAVAXIcon} className="icon" />
                                        </div>
                                    ) : p.productName === "Low-risk Crypto Index" ? (
                                        <div className="icon-container">
                                            <img src={BUSDIcon} className="icon" />
                                            <img src={USDCIcon} className="icon" />
                                            <img src={USDTIcon} className="icon" />
                                        </div>
                                    ) : (
                                        <div className="icon-container">
                                            <img src={AVAXIcon} className="icon" />
                                            <img src={MATICIcon} className="icon" />
                                            <img src={WNEARIcon} className="icon" />
                                        </div>
                                    )} */}
                                </Grid>

                                {/* <Grid item xs={2} className="product-row-container-element">
                  <span>{p.liquidity ? p.liquidity : "78,000.00"}</span>
                </Grid> */}

                                <Grid item xs={2} className="product-row-container-element">
                                    {p.roi ? (
                                        p.roi > 0 ? (
                                            <span className="positive-roi">{p.roi} %</span>
                                        ) : (
                                            <span className="negative-roi">{p.roi} %</span>
                                        )
                                    ) : (
                                        <span className="positive-roi">27.89 %</span>
                                    )}
                                </Grid>

                                <Grid item xs={3} className="product-row-container-element-button">
                                    <Button className="product-button">Invest</Button>
                                </Grid>
                            </Grid>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ProductList;
