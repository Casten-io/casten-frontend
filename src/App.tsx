import React, { useEffect } from "react";
import { store } from "./store";
import { Provider, useDispatch } from "react-redux";
import ViewBase from "./components/ViewBase";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Dashboard, TokenOfferings, BorrowerProfile, Portfolio } from "./Pages";

import Order from "./components/Order";
import { backendUrl } from './constants';
import { updateAssetListExecution } from './store/slices/account';

function App() {
  const dispatch = useDispatch();
  const executeQuery = () => {
    fetch(`${backendUrl}/dune/execute/1629073`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((resp) => resp.json())
      .then((respJson) => dispatch(updateAssetListExecution({
        assetListExecution: respJson.data.execution_id,
      })))
      .catch((error) => {
        console.error('query execution failed: ', error)
      });
  };
  useEffect(() => {
    setInterval(executeQuery, 10 * 60 * 1000);
  }, [])
  return (
    <Router>
      <Provider store={store}>
        <div className="App">
          <ViewBase>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/token" element={<TokenOfferings />} />
              <Route path="/asset" element={<Order />} />
              <Route path="/borrower" element={<BorrowerProfile />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
          </ViewBase>
        </div>
      </Provider>
    </Router>
  );
}

export default App;
