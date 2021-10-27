/* eslint-disable @next/next/no-img-element */
import { ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import web3 from "web3";
import axios from "axios";
import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import MarketItem from "../components/MarketItem";
import { web3context } from "../context/web3ProviderContext";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loaded, setLoaded] = useState("not-loaded");
  const [processing, setProcessing] = useState(false);
  const { provider, signer, connected, connect, error } =
    useContext(web3context);

  useEffect(() => {
    loadNFTs();
  }, [connected, signer]);

  async function loadNFTs() {
    if (!connected) return;
    // write code to load nfts here
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);

        const price = web3.utils.fromWei(i.price.toString(), "ether");
        const item = {
          price,
          name: meta.data.name,
          description: meta.data.description,
          tokenId: i.tokenId.toNumber(),
          image: meta.data.image,
          owner: i.owner,
          seller: i.seller,
          locked: i.locked,
        };
        return item;
      })
    );
    setNfts(items);
    setLoaded("loaded");
  }

  async function buyNft(nft) {
    if (error || processing) return; // show error toast with message
    if (!connected || !provider) return connect();

    setProcessing(true);
    try {
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, signer);
      const marketContract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );

      const price = web3.utils.toWei(nft.price, "ether");
      const transaction = await marketContract.createMarketSale(
        tokenContract.address,
        nft.tokenId,
        { value: price }
      );
      await transaction.wait();
      loadNFTs();
    } catch (e) {
      setProcessing(false);
      // ** display error toast with message
    }
  }

  if (loaded === "loaded" && !nfts.length)
    return <h1 className="p-20 text-4xl">No NFTs!</h1>;
  return (
    <div className="flex justify-center">
      <div style={{ width: 900 }}>
        <div className="grid grid-cols-3 gap-4 pt-8">
          {nfts.map((nft, i) => {
            if (nft.locked) return <MarketItem key={i} nft={nft}></MarketItem>;
            return (
              <MarketItem key={i} onBuyNft={buyNft} nft={nft}></MarketItem>
            );
          })}
        </div>
      </div>
    </div>
  );
}
