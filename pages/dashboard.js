/* eslint-disable @next/next/no-img-element */
import { ethers } from "ethers";
import { useEffect, useState, useContext } from "react";
import web3 from "web3";
import axios from "axios";

import { nftmarketaddress, nftaddress } from "../config";

import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import MarketItem from "../components/MarketItem";
import { web3context } from "../context/web3ProviderContext";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loaded, setLoaded] = useState("not-loaded");
  const { signer, connected } = useContext(web3context);

  useEffect(() => {
    if (loaded == "loaded") return;
    loadNFTs();
  }, [connected]);

  async function loadNFTs() {
    // write code to query own nfts here
    if(!connected) return;

    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, signer);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );

    const data = await marketContract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        const price = web3.utils.fromWei(i.price.toString(), "ether");
        const item = {
          price,
          name: meta.data.name,
          tokenId: i.tokenId.toNumber(),
          image: meta.data.image,
          owner: i.owner,
          seller: i.seller,
          description: meta.data.description,
        };
        return item;
      })
    );

    setNfts(items);
    setLoaded("loaded");
  }

  if (loaded === "loaded" && !nfts.length)
    return <h1 className="p-20 text-4xl">No NFTs!</h1>;

  if (loaded === "not-loaded" && !nfts.length)
    return (
      <button
        // onClick={loadNFTs}
        className="rounded bg-blue-600 py-2 px-12 text-white m-16"
      >
        Loading...
      </button>
    );
  return (
    <div className="flex justify-center">
      <div style={{ width: 900 }}>
        <div className="grid grid-cols-2 gap-4 pt-8">
          {nfts.map((nft, i) => (
            <MarketItem nft={nft} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
