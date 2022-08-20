import Product1 from "../../assets/icons/discord.svg";
import Product2 from "../../assets/icons/discord.svg";
import Assets from "../../assets/icons/discord.svg";
import { IAssetsheet } from ".";
import { useSelector, useDispatch } from "react-redux";

const assets: IAssetsheet[] = [
  {
    secId: "AFT001",
    secName: "USDC DAI",
    description: "Real Time Asset Description",
    value: "$5MM",
    financedate: "Dec 23",
    maturity: "Dec 23",
    status: "Active",
  },
  {
    secId: "AFT002",
    secName: "USDC DAI",
    description: "Real Time Asset Description",
    value: "$2MM",
    financedate: "Nov 23",
    maturity: "Dec 23",
    status: "Active",
  },
];

export default assets;
