import React from "react";
import { store } from "./store";
import { Provider } from "react-redux";
import WalletConnect from "./Components/Commons/WalletConnect";
import ViewBase from "./Components/ViewBase";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import {
  Dashboard,
  SecurityOfferings,
  BorrowerProfile,
  Portfolio,
} from "./Pages";

function App() {
  return (
    <Router>
      <Provider store={store}>
        <div className="App">
          <ViewBase>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/security" element={<SecurityOfferings />} />
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
