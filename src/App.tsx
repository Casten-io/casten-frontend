import React from "react";
import { store } from "./store";
import { Provider } from "react-redux";
import WalletConnect from "./components/Commons/WalletConnect";
import ViewBase from "./components/ViewBase";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Dashboard, SecurityOfferings, BorrowerProfile } from "./Pages";

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
            </Routes>
          </ViewBase>
        </div>
      </Provider>
    </Router>
  );
}

export default App;
