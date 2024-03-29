import React, { useEffect, useState } from "react";
import "./calculator.scss";
import { useSelector, useDispatch } from "react-redux";
import { useWeb3Context } from "../../hooks";
import { Grid, InputAdornment, OutlinedInput, Zoom, Slider } from "@material-ui/core";
import { IReduxState } from "../../store/slices/state.interface";
import { trim } from "../../helpers";
import { Skeleton } from "@material-ui/lab";

function Calculator() {
    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const marketPrice = useSelector<IReduxState, number>(state => {
        return state.app.marketPrice;
    });
    const stakingAPY = useSelector<IReduxState, number>(state => {
        return state.app.stakingAPY;
    });
    const gD33dBalance = useSelector<IReduxState, string>(state => {
        return state.account.balances && state.account.balances.gD33d;
    });

    const trimmedStakingAPY = trim(stakingAPY * 100, 1);
    const trimmedgD33dBalance = trim(Number(gD33dBalance), 6);
    const trimeMarketPrice = trim(marketPrice, 2);

    const [fsD33dAmount, setD33dAmount] = useState(trimmedgD33dBalance);
    const [rewardYield, setRewardYield] = useState(trimmedStakingAPY);
    const [priceAtPurchase, setPriceAtPurchase] = useState(trimeMarketPrice);
    const [futureMarketPrice, setFutureMarketPrice] = useState(trimeMarketPrice);
    const [days, setDays] = useState(30);

    const [rewardsEstimation, setRewardsEstimation] = useState("0");
    const [potentialReturn, setPotentialReturn] = useState("0");

    const calcInitialInvestment = () => {
        const fsD33d = Number(fsD33dAmount) || 0;
        const price = parseFloat(priceAtPurchase) || 0;
        const amount = fsD33d * price;
        return trim(amount, 2);
    };

    const calcCurrentWealth = () => {
        const fsD33d = Number(fsD33dAmount) || 0;
        const price = parseFloat(trimeMarketPrice);
        const amount = fsD33d * price;
        return trim(amount, 2);
    };

    const [initialInvestment, setInitialInvestment] = useState(calcInitialInvestment());

    useEffect(() => {
        const newInitialInvestment = calcInitialInvestment();
        setInitialInvestment(newInitialInvestment);
    }, [fsD33dAmount, priceAtPurchase]);

    const calcNewBalance = () => {
        let value = parseFloat(rewardYield) / 100;
        value = Math.pow(value + 1, 1 / (365 * 3)) || 1;
        let balance = Number(fsD33dAmount);
        balance = balance * Math.pow(value, days * 3);
        return balance;
    };

    useEffect(() => {
        const newBalance = calcNewBalance();
        setRewardsEstimation(trim(newBalance, 6));
        const newPotentialReturn = newBalance * (parseFloat(futureMarketPrice) || 0);
        setPotentialReturn(trim(newPotentialReturn, 2));
    }, [days, rewardYield, futureMarketPrice, fsD33dAmount]);

    return (
        <div className="calculator-view">
            <Zoom in={true}>
                <div className="calculator-card">
                    <Grid className="calculator-card-grid" container direction="column" spacing={2}>
                        <Grid item>
                            <div className="calculator-card-header">
                                <p className="calculator-card-header-title">Calculator</p>
                                <p className="calculator-card-header-subtitle">Estimate your returns</p>
                            </div>
                        </Grid>
                        <Grid item>
                            <div className="calculator-card-metrics">
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4} md={4} lg={4}>
                                        <div className="calculator-card-apy">
                                            <p className="calculator-card-metrics-title">D33D Price</p>
                                            <p className="calculator-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `$${trimeMarketPrice}`}</p>
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} sm={4} md={4} lg={4}>
                                        <div className="calculator-card-tvl">
                                            <p className="calculator-card-metrics-title">Current APY</p>
                                            <p className="calculator-card-metrics-value">
                                                {isAppLoading ? <Skeleton width="100px" /> : <>{new Intl.NumberFormat("en-US").format(Number(trimmedStakingAPY))}%</>}
                                            </p>
                                        </div>
                                    </Grid>
                                    <Grid item xs={6} sm={4} md={4} lg={4}>
                                        <div className="calculator-card-index">
                                            <p className="calculator-card-metrics-title">Your fsD33D Balance</p>
                                            <p className="calculator-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : <>{trimmedgD33dBalance} fsD33D</>}</p>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                        </Grid>

                        <div className="calculator-card-area">
                            <div>
                                <div className="calculator-card-action-area">
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <div className="calculator-card-action-area-inp-wrap">
                                                <p className="calculator-card-action-area-inp-wrap-title">fsD33D Amount</p>
                                                <OutlinedInput
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="calculator-card-action-input"
                                                    value={fsD33dAmount}
                                                    onChange={e => setD33dAmount(e.target.value)}
                                                    labelWidth={0}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <div onClick={() => setD33dAmount(trimmedgD33dBalance)} className="stake-card-action-input-btn">
                                                                <p>Max</p>
                                                            </div>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <div className="calculator-card-action-area-inp-wrap">
                                                <p className="calculator-card-action-area-inp-wrap-title">APY (%)</p>
                                                <OutlinedInput
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="calculator-card-action-input"
                                                    value={rewardYield}
                                                    onChange={e => setRewardYield(e.target.value)}
                                                    labelWidth={0}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <div onClick={() => setRewardYield(trimmedStakingAPY)} className="stake-card-action-input-btn">
                                                                <p>Current</p>
                                                            </div>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <div className="calculator-card-action-area-inp-wrap">
                                                <p className="calculator-card-action-area-inp-wrap-title">D33D price at purchase ($)</p>
                                                <OutlinedInput
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="calculator-card-action-input"
                                                    value={priceAtPurchase}
                                                    onChange={e => setPriceAtPurchase(e.target.value)}
                                                    labelWidth={0}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <div onClick={() => setPriceAtPurchase(trimeMarketPrice)} className="stake-card-action-input-btn">
                                                                <p>Current</p>
                                                            </div>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <div className="calculator-card-action-area-inp-wrap">
                                                <p className="calculator-card-action-area-inp-wrap-title">Future D33D market price ($)</p>
                                                <OutlinedInput
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="calculator-card-action-input"
                                                    value={futureMarketPrice}
                                                    onChange={e => setFutureMarketPrice(e.target.value)}
                                                    labelWidth={0}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <div onClick={() => setFutureMarketPrice(trimeMarketPrice)} className="stake-card-action-input-btn">
                                                                <p>Current</p>
                                                            </div>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </div>
                                <div className="calculator-days-slider-wrap">
                                    <p className="calculator-days-slider-wrap-title">{`${days} day${days > 1 ? "s" : ""}`}</p>
                                    <Slider className="calculator-days-slider" min={1} max={365} value={days} onChange={(e, newValue: any) => setDays(newValue)} />
                                </div>
                                <div className="calculator-user-data">
                                    <div className="data-row">
                                        <p className="data-row-name">Your initial investment</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>${initialInvestment}</>}</p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">Current wealth</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>${calcCurrentWealth()}</>}</p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">D33D rewards estimation</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>{rewardsEstimation} D33D</>}</p>
                                    </div>
                                    <div className="data-row">
                                        <p className="data-row-name">Potential return</p>
                                        <p className="data-row-value">{isAppLoading ? <Skeleton width="80px" /> : <>${potentialReturn}</>}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Grid>
                </div>
            </Zoom>
        </div>
    );
}

export default Calculator;
