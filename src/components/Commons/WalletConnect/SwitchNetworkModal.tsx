import { FC } from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

import { CHAIN_INFO, Networks } from '../../../constants';
import QuestionMarkCircleSolidIcon from '../../Drawer/drawer-content/icons/QuestionMarkCIrcleSolidIcon';
import { AngleRightCircleIcon } from '../../Drawer/drawer-content/icons';
import { toHexTrimZero } from '../../../helpers/switch-network';
import { RootState } from '../../../store';
import { useWallet } from '../../../contexts/WalletContext';
import { ethers } from 'ethers';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 3,
  p: 4,
};

const SwitchNetworkModal: FC<{
  close: () => void
  open: boolean
}> = (props) => {
  const { close, open } = props;
  const address = useSelector((state: RootState) => state.account.address);
  const { provider } = useWallet()
  const stateNetworkInfo = useSelector((state: RootState) => state.account.networkInfo);

  const switchNetwork = async () => {
    try {
      if (provider && stateNetworkInfo && address && !Object.values(Networks).includes(stateNetworkInfo.chainId?.toString())) {
        const signer = (provider as ethers.providers.Web3Provider)
        await signer.send('wallet_switchEthereumChain', [
          { chainId: toHexTrimZero(Networks.PolyMain) },
        ]);
        close();
      }
    } catch (e) {
      console.log(e);
    }
  }

  if (!stateNetworkInfo) {
    return null;
  }

  return <Modal
    open={open}
    onClose={close}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box sx={style}>
      <Box
        display="flex"
        justifyContent="space-between"
      >
        <Box pl={2} display="flex" flexDirection="column" alignItems="center" py={3}>
          <Box width="50px" height="50px" mb={2}>
            {(
              CHAIN_INFO[stateNetworkInfo.chainId.toString()] &&
              <img
                src={CHAIN_INFO[stateNetworkInfo.chainId.toString()].logo}
                width="50px"
                height="50px"
                style={{
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                alt="chain-logo"
              />
            ) || <QuestionMarkCircleSolidIcon fill="#5f5f5f" size="50"/>}
          </Box>
          <Typography fontWeight="normal" textTransform="capitalize">
            {CHAIN_INFO[stateNetworkInfo.chainId.toString()]?.name || stateNetworkInfo?.name}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center" width="20">
          <AngleRightCircleIcon size="20" fill="#909090"/>
        </Box>
        <Box pr={2} display="flex" flexDirection="column" alignItems="center" py={3}>
          <Box width="50px" height="50px" mb={2}>
            <img src={CHAIN_INFO[Networks.PolyMain.toString()].logo} width="50px" alt="chain-logo"/>
          </Box>
          <Typography fontWeight="normal" textTransform="capitalize">
            {CHAIN_INFO[Networks.PolyMain.toString()].name}
          </Typography>
        </Box>
      </Box>
      <Typography mb={3} textAlign="center">
        Switching network to {CHAIN_INFO[Networks.PolyMain.toString()].name} from&nbsp;
        {CHAIN_INFO[stateNetworkInfo.chainId.toString()]?.name || stateNetworkInfo?.name}
      </Typography>
      <Box display="flex" justifyContent="space-between">
        <Button onClick={close} variant="outlined" color="warning">
          Cancel
        </Button>
        <Button onClick={switchNetwork} variant="outlined" color="info">
          Switch
        </Button>
      </Box>
    </Box>
  </Modal>
}

export default SwitchNetworkModal
