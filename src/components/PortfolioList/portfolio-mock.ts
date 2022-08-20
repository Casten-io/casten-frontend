import Product1 from "../../assets/icons/discord.svg";
import Product2 from "../../assets/icons/discord.svg";
import Assets from "../../assets/icons/discord.svg";
import { IPortfoliosheet } from ".";
import { useSelector, useDispatch } from "react-redux";

const portfolio: IPortfoliosheet[] = [
  {
    select: "",
    symbol: "FTech SNR",
    sec_name: "Sec Name",
    issuer: "A Fintech",
    apy: "10.5%",
    maturity: "Dec 2023",
    tranche: "Senior",
    frequency: "Monthly",
    price: "1.0",
    profitloss: "10,000",
    invested: "500,000",
    exposure: "510,000",
    percent_exp: "51%",
  },
];

export default portfolio;
