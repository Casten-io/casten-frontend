export * from "./blockchain";
// export * from "./addresses";
export const signatureType = "EIP712_SIGN";

export const backendUrl = process.env.REACT_BACKEND_SERVER_URL || 'http://backend.casten.io/api'
