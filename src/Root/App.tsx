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
import { Stake, ChooseBond, Bond, Dashboard, NotFound, Calculator, Convert, Mint, LendBorrow, LendBorrowHoldings, Lend } from "../views";
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

    //     async function loadDetails(whichDetails: string) {
    //         let loadProvider = provider;

    //         if (whichDetails === "app") {
    //             loadApp(loadProvider);
    //         }

    //         if (whichDetails === "account" && address && connected) {
    //             loadAccount(loadProvider);
    //             if (isAppLoaded) return;

    //             loadApp(loadProvider);
    //         }

    //         if (whichDetails === "userBonds" && address && connected) {
    //             bonds.map(bond => {
    //                 dispatch(calculateUserBondDetails({ address, bond, provider, networkID: chainID }));
    //             });
    //         }

    //         if (whichDetails == "pd33dBalances" && address && connected) {
    //             loadConvert(loadProvider);
    //         }

    //         if (whichDetails == "mintBalances" && address && connected) {
    //             loadMint(loadProvider);
    //         }

    //         if (whichDetails == "usmBalances" && address && connected) {
    //             loadUsmLending(loadProvider);
    //         }
    //         /*  [TODO]
    //         if (whichDetails === "userTokens" && address && connected) {
    //             tokens.map(token => {
    //                 dispatch(calculateUserTokenDetails({ address, token, provider, networkID: chainID }));
    //             });
    //         }
    // */
    //     }

    //     const loadConvert = useCallback(
    //         loadProvider => {
    //             dispatch(getPd33dBalances({ address, networkID: chainID, provider: loadProvider }));
    //         },
    //         [connected],
    //     );

    //     const loadMint = useCallback(
    //         loadProvider => {
    //             dispatch(getMintBalances({ address, networkID: chainID, provider: loadProvider }));
    //         },
    //         [connected],
    //     );

    //     const loadApp = useCallback(
    //         loadProvider => {
    //             dispatch(loadAppDetails({ networkID: chainID, provider: loadProvider }));
    //             bonds.map(bond => {
    //                 dispatch(calcBondDetails({ bond, value: null, provider: loadProvider, networkID: chainID }));
    //             });
    //             /*  [TODO]
    //             tokens.map(token => {
    //                 dispatch(calculateUserTokenDetails({ address: "", token, provider, networkID: chainID }));
    //             });
    // */
    //         },
    //         [connected],
    //     );

    //     const loadAccount = useCallback(
    //         loadProvider => {
    //             dispatch(loadAccountDetails({ networkID: chainID, address, provider: loadProvider }));
    //         },
    //         [connected],
    //     );

    //     const loadUsmLending = useCallback(
    //         loadProvider => {
    //             dispatch(getUsmAccountStatus({ networkID: chainID, account: address, provider: loadProvider }));
    //         },
    //         [connected]
    //     );

    useEffect(() => {
        if (hasCachedProvider()) {
            connect().then(() => {
                setWalletChecked(true);
            });
        } else {
            setWalletChecked(true);
        }
    }, []);

    // useEffect(() => {
    //     if (walletChecked) {
    //         loadDetails("app");
    //         loadDetails("account");
    //         loadDetails("userBonds");
    //         loadDetails("userTokens");
    //         loadDetails("pd33dBalances");
    //         loadDetails("mintBalances");
    //         loadDetails("usmBalances");
    //     }
    // }, [walletChecked]);

    // useEffect(() => {
    //     if (connected) {
    //         loadDetails("app");
    //         loadDetails("account");
    //         loadDetails("userBonds");
    //         loadDetails("userTokens");
    //         loadDetails("pd33dBalances");
    //         loadDetails("mintBalances");
    //         loadDetails("usmBalances");
    //     }
    // }, [connected]);

    // if (isAppLoading) return <Loading />;

    return (
        <ViewBase>
            <Switch>
                <Route exact path="/dashboard">
                    <Dashboard />
                </Route>

                <Route exact path="/">
                    <Redirect to="/stake" />
                </Route>

                <Route path="/stake">
                    <Stake />
                </Route>

                <Route path="/calculator">
                    <Calculator />
                </Route>

                <Route path="/convert">
                    <Convert />
                </Route>

                <Route path="/mint">
                    <Mint />
                </Route>

                <Route path="/lend-borrow">
                    <LendBorrow />
                </Route>

                <Route path="/lend-borrow-holdings">
                    <LendBorrowHoldings />
                </Route>

                <Route path="/lend">
                    <Lend />
                </Route>

                <Route component={NotFound} />
            </Switch>
        </ViewBase>
    );
}

export default App;
