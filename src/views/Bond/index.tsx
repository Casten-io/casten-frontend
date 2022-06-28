import { useState } from "react";
import { useSelector } from "react-redux";
import { trim } from "../../helpers";
import { Grid, Backdrop, Box, Fade } from "@material-ui/core";
import TabPanel from "../../components/TabPanel";
import BondHeader from "./BondHeader";
import BondRedeem from "./BondRedeem";
import BondPurchase from "./BondPurchase";
import BondPurchaseNFT from "./BondPurchaseNFT";
import "./bond.scss";
import { useWeb3Context } from "../../hooks";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";
import { IAllBondData } from "../../hooks/bonds";
import classnames from "classnames";
import HappyHourTag from "src/components/HappyHourTag/HappyHourTag";

interface IBondProps {
    bond: IAllBondData;
}

function Bond({ bond }: IBondProps) {
    const { address } = useWeb3Context();

    const [slippage, setSlippage] = useState(0.5);

    const [view, setView] = useState(0);

    const isBondLoading = useSelector<IReduxState, boolean>(state => state.bonding.loading ?? true);

    const onSlippageChange = (value: any) => {
        return setSlippage(value);
    };

    const changeView = (newView: number) => () => {
        setView(newView);
    };

    return (
        <Fade in={true} mountOnEnter unmountOnExit>
            <Grid className="bond-view">
                <Backdrop open={true}>
                    <Fade in={true}>
                        <div className="bond-card">
                            {bond.allowedHappyHour&&<HappyHourTag/>}

                            <div style={{marginTop: "32px"}}>
                                <BondHeader bond={bond} slippage={slippage} onSlippageChange={onSlippageChange} />
                            </div>
                           
                            {/* @ts-ignore */}
                            <Box direction="row" className="bond-price-data-row">
                                <div className="bond-price-data">
                                    <p className="bond-price-data-title">Bond Price</p>
                                    <p className="bond-price-data-value">
                                        {isBondLoading ? <Skeleton /> : `$${trim(bond.bondPrice, 2)}`}
                                    </p>
                                </div>
                                <div className="bond-price-data">
                                    <p className="bond-price-data-title">D33D Price</p>
                                    <p className="bond-price-data-value">{isBondLoading ? <Skeleton /> : `$${trim(bond.marketPrice, 2)}`}</p>
                                </div>
                            </Box>

                            <div className="bond-one-table">
                                <div className={classnames("bond-one-table-btn", { active: !view })} onClick={changeView(0)}>
                                    <p>Bond</p>
                                </div>
                                <div className={classnames("bond-one-table-btn", { active: view })} onClick={changeView(1)}>
                                    <p>Redeem</p>
                                </div>
                            </div>

                            <TabPanel value={view} index={0}>
                            {
                                bond.isNFT ? 
                                    <BondPurchaseNFT bond={bond} slippage={slippage} /> : 
                                    <BondPurchase bond={bond} slippage={slippage} />
                            }
                            </TabPanel>

                            <TabPanel value={view} index={1}>
                                <BondRedeem bond={bond} />
                            </TabPanel>
                        </div>
                    </Fade>
                </Backdrop>
            </Grid>
        </Fade>
    );
}

export default Bond;
