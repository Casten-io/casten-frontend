export * from "./blockchain";
// export * from "./addresses";
export const signatureType = "EIP712_SIGN";

export const backendUrl = process.env.REACT_APP_BACKEND_SERVER_URL || 'http://localhost:3001/api';
export const securitizeURL = process.env.REACT_APP_SECURITIZE_URL || 'https://id.securitize.io';
export const securitizeDomainId = process.env.REACT_APP_SECURITIZE_DOMAIN_ID || '41c54ddb-0b0d-43b2-bb13-987e83519d43';
export const infuraId = process.env.REACT_APP_INFURA_ID;
