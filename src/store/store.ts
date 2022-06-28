import { configureStore } from "@reduxjs/toolkit";

import accountReducer from "./slices/account-slice";
import bondingReducer from "./slices/bond-slice";
import appReducer from "./slices/app-slice";
import pendingTransactionsReducer from "./slices/pending-txns-slice";
import messagesReducer from "./slices/messages-slice";
import convertReducer from "./slices/convert-slice";
import mintReducer from "./slices/mint-slice";
import biconomyReducer from "./slices/biconomy-slice";
import usmLendingReducer from "./slices/usm-lending-slice";

const store = configureStore({
    reducer: {
        account: accountReducer,
        bonding: bondingReducer,
        app: appReducer,
        pendingTransactions: pendingTransactionsReducer,
        messages: messagesReducer,
        convert: convertReducer,
        mint: mintReducer,
        biconomy: biconomyReducer,
        usmLending: usmLendingReducer
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
