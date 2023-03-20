import React, { useEffect } from "react";
import { store } from "./store";
import { Provider, useDispatch } from "react-redux";
import ViewBase from "./components/ViewBase";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Dashboard, TokenOfferings, BorrowerProfile, Portfolio, SecuritizeAuthorize } from "./Pages";

import Order from "./components/Order";

function App() {
  return (
    <Router>
      <Provider store={store}>
        <div className="App">
          <ViewBase>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/token" element={<TokenOfferings />} />
              <Route path="/asset/:id" element={<Order />} />
              <Route path="/borrower" element={<BorrowerProfile />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/securitize-authorize" element={<SecuritizeAuthorize />} />
              <Route path="/securitize-kyc-doc-uploaded" element={<SecuritizeAuthorize />} />
            </Routes>
          </ViewBase>
        </div>
      </Provider>
    </Router>
  );
}

export default App;
