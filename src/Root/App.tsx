import { useEffect, useState, useCallback } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAddress, useWeb3Context } from "../hooks";
import { getPd33dBalances } from "../store/slices/convert-slice";
import { calcBondDetails } from "../store/slices/bond-slice";
import { loadAppDetails } from "../store/slices/app-slice";
import { getMintBalances } from "src/store/slices/mint-slice";
import { loadAccountDetails, calculateUserBondDetails, calculateUserTokenDetails } from "../store/slices/account-slice";
import { getUsmAccountStatus } from "src/store/slices/usm-lending-slice";
import { IReduxState } from "../store/slices/state.interface";
import Loading from "../components/Loader";
import useBonds from "../hooks/bonds";
import ViewBase from "../components/ViewBase";
import { ChooseBond, Bond, Dashboard, NotFound, CreditProfile, Convert, Mint, Security, BorrowerProfile, Portfolio, Lend } from "../views";
import "./style.scss";
import useTokens from "../hooks/tokens";

function App() {
    const dispatch = useDispatch();

    const { connect, provider, hasCachedProvider, chainID, connected } = useWeb3Context();
    const address = useAddress();

    const [walletChecked, setWalletChecked] = useState(false);

    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const isAppLoaded = useSelector<IReduxState, boolean>(state => !Boolean(state.app.marketPrice));

    const { bonds } = useBonds();
    const { tokens } = useTokens();

    useEffect(() => {
        if (hasCachedProvider()) {
            connect().then(() => {
                setWalletChecked(true);
            });
        } else {
            setWalletChecked(true);
        }
    }, []);

    return (
        <ViewBase>
            <Switch>
                <Route exact path="/dashboard">
                    <Dashboard />
                </Route>

                <Route exact path="/">
                    <Redirect to="/dashboard" />
                </Route>

                <Route path="/borrower">
                    <BorrowerProfile />
                </Route>

                <Route path="/convert">
                    <Convert />
                </Route>

                <Route path="/mint">
                    <Mint />
                </Route>
                <Route path="/security">
                    <Security />
                </Route>

                <Route path="/credit-profile">
                    <CreditProfile />
                </Route>

                <Route path="/portfolio">
                    <Portfolio />
                </Route>

                <Route path="/lend-borrow-holdings">{/* <LendBorrowHoldings /> */}</Route>

                <Route path="/lend">{/* <Lend /> */}</Route>

                <Route component={NotFound} />
            </Switch>
        </ViewBase>
    );
}

export default App;
