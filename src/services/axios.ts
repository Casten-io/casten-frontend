import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_API_ENDPOINT || "https://test.metapoly.org/api"

export default axios;