import { Grid, Backdrop, Box, Fade, Button } from "@mui/material";
import products from "./product-mock";
import "./style.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface IProduct {
  secId: string;
  secName: string;
  apy: string;
  frequency: string;
  maturity: string;
  issuer: string;
  totalIssuance: string;
  availableIssuance: string;
  category: string;
  ltv: string;
  leverage: string;
  moreInfo: string;
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
      <Grid item className="table-header-item-mid">
        <span className="text">Sec ID</span>
      </Grid>

      <Grid item className="table-header-item-mid">
        <span className="text">Sec Name</span>
      </Grid>
      <Grid item className="table-header-item">
        <span className="text">APY</span>
      </Grid>

      <Grid item className="table-header-item">
        <span className="text">Frequency</span>
      </Grid>
      <Grid item className="table-header-item">
        <span className="text">Maturity</span>
      </Grid>
      <Grid item className="table-header-item-mid">
        <span className="text">Issuer</span>
      </Grid>
      <Grid item className="table-header-item">
        <span className="text">Total Issuance</span>
      </Grid>
      <Grid item className="table-header-item">
        <span className="text">Available Issuance</span>
      </Grid>
      <Grid item className="table-header-item-wide">
        <span className="text">Category</span>
      </Grid>
      <Grid item className="table-header-item">
        <span className="text">LTV</span>
      </Grid>
      <Grid item className="table-header-item">
        <span className="text">Leverage</span>
      </Grid>
      <Grid item className="table-header-item">
        <span className="text">More Info</span>
      </Grid>
    </Grid>
  );
}

function ProductList() {
  const navigate = useNavigate();

  const navigateToSecurity = () => {
    navigate("/security");
  };
  return (
    <div className="product-container">
      <ProductListHeader />

      <div className="product-container-rows">
        {products.map((p, index: number) => {
          return (
            <div className="product-row">
              <Grid
                container
                className="product-row-container"
                onClick={navigateToSecurity}
              >
                <Grid item className="table-value-item-mid">
                  <span className="text">{p.secId}</span>
                </Grid>

                <Grid item className="table-value-item-mid">
                  <span className="text">{p.secName}</span>
                </Grid>
                <Grid item className="table-value-item">
                  <span className="text">{p.apy}</span>
                </Grid>
                <Grid item className="table-value-item">
                  <span className="text">{p.frequency}</span>
                </Grid>
                <Grid item className="table-value-item">
                  <span className="text">{p.maturity}</span>
                </Grid>
                <Grid item className="table-value-item-mid">
                  <span className="text">{p.issuer}</span>
                </Grid>
                <Grid item className="table-value-item">
                  <span className="text">{p.totalIssuance}</span>
                </Grid>
                <Grid item className="table-value-item">
                  <span className="text">{p.availableIssuance}</span>
                </Grid>
                <Grid item className="table-value-item-wide">
                  <span className="text">{p.category}</span>
                </Grid>
                <Grid item className="table-value-item">
                  <span className="text">{p.ltv}</span>
                </Grid>
                <Grid item className="table-value-item">
                  <span className="text">{p.leverage}</span>
                </Grid>
                <Grid item className="table-value-item">
                  <span className="text">{p.moreInfo}</span>
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
