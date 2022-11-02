import React from "react";
import { store } from "./store";
import { Provider } from "react-redux";
import ViewBase from "./Components/ViewBase";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Dashboard, TokenOfferings, BorrowerProfile, Portfolio } from "./Pages";

import Order from "./Components/Order";

function App() {
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
