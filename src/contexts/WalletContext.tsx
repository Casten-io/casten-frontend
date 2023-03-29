import React, {
  createContext, FC, ReactNode, useContext, useState,
} from 'react'
import { ethers } from 'ethers';
import { infuraId } from '../constants';

type WalletContextData = {
  provider: ethers.providers.Web3Provider | ethers.providers.BaseProvider
  setProvider: (provider: ethers.providers.Web3Provider | ethers.providers.BaseProvider) => void
}

const WalletContext = createContext<WalletContextData>({} as WalletContextData)

const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const publicProvider = ethers.getDefaultProvider(`https://polygon-mainnet.infura.io/v3/${infuraId}`)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | ethers.providers.BaseProvider>(publicProvider)
  return (
    <WalletContext.Provider
      value={{
        provider,
        setProvider,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

const useWallet = (): WalletContextData => {
  const context = useContext(WalletContext)

  if (!context) {
    throw new Error('useWallet must be used within an WalletProvider')
  }

  return context
}

export { WalletContext, WalletProvider, useWallet }
