import Product1 from "../../assets/icons/discord.svg";
import Product2 from "../../assets/icons/discord.svg";
import Assets from "../../assets/icons/discord.svg";
import { IProduct } from ".";
import { useSelector, useDispatch } from "react-redux";

const products: IProduct[] = [
    {
        productIcon: Product1,
        productName: "Market Weighted Index",
        assetIcon: Assets,
        liquidity: 123434343,
        roi: 47,
    },
    {
        productIcon: Product2,
        productName: "Low Risk Crypto",
        assetIcon: Assets,
        liquidity: 123434343,
        roi: 47,
    },
    {
        productIcon: Product1,
        productName: "Market Weighted Index",
        assetIcon: Assets,
        liquidity: 123434343,
        roi: 47,
    },
    {
        productIcon: Product2,
        productName: "Low Risk Crypto",
        assetIcon: Assets,
        liquidity: 123434343,
        roi: 47,
    },
];

export default products;
