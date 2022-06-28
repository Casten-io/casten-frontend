import { ChainId, CHAINLINK_ORACLE_ADDRESS } from '@sushiswap/core-sdk'
export { BandOracle } from './BandOracle'
export { DIAOracle } from './DIAOracle'
import { ChainlinkOracle } from './ChainlinkOracle'
export * from './Oracle'

// @ts-ignore TYPE NEEDS FIXING
export function getOracle(chainId: ChainId = ChainId.ETHEREUM, address: string, data: string): Oracle {
    // if (address.toLowerCase() === CHAINLINK_ORACLE_ADDRESS[chainId].toLowerCase()) {
    //   return new ChainlinkOracle(chainId, address, data)
    // }
    return new ChainlinkOracle(chainId, address, data)
  }
  