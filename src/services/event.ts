import axios from "./axios";

export const getBiconomyEvent = (amount?: number | undefined) => {
    return axios.get('/v1/contracts/event', { params: { amount }})
}

