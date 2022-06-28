import { Box, Modal, Paper, Grid, SvgIcon, IconButton, FormControl, OutlinedInput, InputLabel, InputAdornment } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from 'axios';

import { IReduxState } from "../../store/slices/state.interface";
import { IAccountSlice } from "../../store/slices/account-slice";
import { useAddress } from "../../hooks";

import "./selectNft.scss";
import nftSampleImage from "../../assets/images/nft-sample.png";

interface ISelectNFTModalProps {
    open: boolean;
    collection: string;                     // NFT address
    handleClose: () => void;
    onSelectNFT: (e: string) => void;
}

interface INftItem {
    tokenID: string;
    name: string;
    image: string;
}

interface IDecentralandAsset {
    token_id: number;
    name: string;
    image_preview_url: string;
}

function SelectNFTModal({ open, collection, handleClose, onSelectNFT }: ISelectNFTModalProps) {
    const [holdings, setHoldings] = useState<INftItem[]>([])

    const onClickToken = (tokenID: string) => {
        onSelectNFT(tokenID);
    }

    const address = useAddress();

    useEffect(() => {
        // [TODO] asset_contract_address, owner params are test purpose now. please replace in the production.
        const fetchHoldings = async () => {
            const {data} = await axios.get(
                'https://rinkeby-api.opensea.io/api/v1/assets', // [TODO] api.opensea.io
                {
                    params: {
                        order_direction: 'desc',
                        offset: 0,
                        limit: 20,
                        asset_contract_address: collection,
                        owner: address
                    }
                }
            )

            const items: INftItem[] = data.assets.map((item: IDecentralandAsset) => ({
                tokenID: item.token_id,
                name: item.name,
                image: item.image_preview_url
            }))
            setHoldings(items);
        }

        fetchHoldings();
    }, [])

    return (
        <Modal id="nft-modal" open={open} onClose={handleClose} hideBackdrop>
            <Paper className="ohm-card ohm-popover">
                <div className="cross-wrap">
                    <div onClick={handleClose} className="cancel-setting" />
                </div>

                <div className="nft-modal__header">
                    <p className="nft-modal__title">SELECT NFT</p>
                    <p className="nft-modal__sub-title">Select NFT which you wish to Bond</p>
                </div>

                <Box className="card-content">
                    {
                        (holdings.length > 0) && 
                        (
                            <Grid container spacing={4}>
                                {
                                    holdings.map((item: INftItem) => (
                                        <Grid item lg={4} md={6} sm={6} xs={12} key={item.tokenID}>
                                            <Token name={item.name} id={item.tokenID} image={item.image} onClickToken={onClickToken} />
                                        </Grid>
                                    ))
                                }
                            </Grid>
                        )
                    }
                    {
                        !holdings.length && (
                            <div className="no-nft-balance">No Balance!</div>
                        )
                    }
                </Box>
            </Paper>
        </Modal>
    );
}

function Token({name, id, image, onClickToken}: {name: string, id:string, image: string, onClickToken: (id: string) => void}) {
    const shorten = (input: string, limit: number = 4) => {
        if (!input || input.length < limit) return input;
        return input.slice(0,2) + '...' + input.slice(-2)
    }

    return (
        <div className="nft-item" onClick={() => onClickToken(id)}>
            <img src={image} alt="No image yet" />
            <div className="nft-item__info">
                <div className="nft-item__info__name">
                    {name}
                </div>

                <div className="nft-item__info__id">
                    {shorten(id, 4)}
                </div>
            </div>
        </div>
    )
}
export default SelectNFTModal;
