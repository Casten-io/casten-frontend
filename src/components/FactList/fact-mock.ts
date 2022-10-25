import { useSelector, useDispatch } from "react-redux";
import Product1 from "../../assets/icons/discord.svg";
import Product2 from "../../assets/icons/discord.svg";
import Assets from "../../assets/icons/discord.svg";
import { IFactsheet } from ".";

const facts: IFactsheet[] = [
  {
    secId: "AFT001",
    secName: "Sr. A Fintech 11% 2023",
    tranche: "Senior",
    totalIssuance: "$5MM",
    apy: "11.00%",
    frequency: "Monthly",
    maturity: "Dec 23",
    ltv: "0.8",
    leverage: "3.0",
  },
  {
    secId: "AFT002",
    secName: "Jr. A Fintech 11% 2023",
    tranche: "Junior",
    totalIssuance: "$2MM",
    apy: "15.00%",
    frequency: "Monthly",
    maturity: "Dec 23",
    ltv: "0.8",
    leverage: "3.0",
  },
];

export default facts;
