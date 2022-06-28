import axios from "axios";

const cache: { [key: string]: number } = {};

export const loadTokenPrices = async () => {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin,tether,decentraland,the-sandbox&vs_currencies=usd";
    const { data } = await axios.get(url);

    cache["ETH"] = data["ethereum"].usd;
    cache["USDC"] = data["usd-coin"].usd;
    cache["USDT"] = data["tether"].usd;
    cache["MANA"] = data["decentraland"].usd;
    cache["SAND"] = data["the-sandbox"].usd;
/*
    // [TODO]
    cache["ETH"] = 3818;
    cache["USDC"] = 0.999;
    cache["USDC"] = 1.001;
    cache["MANA"] = 3.23;
    cache["SAND"] = 4.76;
*/
};

export const getTokenPrice = (symbol: string): number => {
    return Number(cache[symbol]);
};
