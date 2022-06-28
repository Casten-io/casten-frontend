import { IPendingTxn } from "./pending-txns-slice";
import { IAccountSlice } from "./account-slice";
import { IAppSlice } from "./app-slice";
import { IBondSlice } from "./bond-slice";
import { MessagesState } from "./messages-slice";
import { IConvertSlice } from "./convert-slice";
import { IMintSlice } from "./mint-slice";
import { IBiconomySlice } from "./biconomy-slice";
import { IUsmLendingSlice } from "./usm-lending-slice";

export interface IReduxState {
    pendingTransactions: IPendingTxn[];
    account: IAccountSlice;
    app: IAppSlice;
    bonding: IBondSlice;
    messages: MessagesState;
    convert: IConvertSlice;
    mint: IMintSlice;
    biconomy: IBiconomySlice;
    usmLending: IUsmLendingSlice;
}
