import React from 'react';
import {store} from './store'
import {Provider} from 'react-redux';
import WalletConnect from "./Components/Commons/WalletConnect";

function App() {
    return (
        <Provider store={store}>
            <div className="App">
                <WalletConnect/>
            </div>
        </Provider>
    );
}

export default App;
