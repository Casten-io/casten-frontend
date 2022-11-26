import Avax from '../assets/icons/chains/avalanche.svg'
import Eth from '../assets/icons/chains/ethereum.svg'
import Polygon from '../assets/icons/chains/polygon.svg'

export const TOKEN_DECIMALS = 9;

export enum Networks {
  Mumbai = 80001,
  PolyMain = 137,
}

export const CHAIN_INFO: {
  [p: string]: {
    name: string
    logo: string
  }
} = {
  '1': {
    name: 'Ethereum',
    logo: Eth,
  },
  '43114': {
    name: 'Avalanche',
    logo: Avax,
  },
  '137': {
    name: 'Polygon',
    logo: Polygon,
  },
  '80001': {
    name: 'Polygon Mumbai',
    logo: Polygon,
  },
}

export const DEFAULT_NETWORK = Networks.Mumbai;
