/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import web3 from "web3";
// import Image from "next/image";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { web3context } from "../context/web3ProviderContext";

export default function Home() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signer, connected } = useContext(web3context);

  async function createSale(url) {
    if (!connected) return;
    console.log("url ", url);

    // ** write code to create sale here
    console.log("create sale ", connected);
    setLoading(true);
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, signer);

    let transaction = await tokenContract.createToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let price = web3.utils.toWei(formInput.price, "ether");
    let tokenId = value.toNumber();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );

    const listingPrice = web3.utils.toWei("0.01", "ether");
    transaction = await marketContract.createMarketItem(
      tokenContract.address,
      tokenId,
      price,
      { value: listingPrice }
    );
    await transaction.wait();
    setLoading(false);
    router.push("/");
  }

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      setLoading(true)
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      setLoading(false);
      console.log("Error uploading file: ", error);
    }
    setLoading(false);
  }

  async function createMarket() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      createSale(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  return (
    <div className="flex justify-center mb-40">
      <div className="w-1/2 flex flex-col pb-12 nft_form">
        <h1>Upload NFT to marketplace</h1>
        <input
          placeholder="NFT Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <input
          placeholder="NFT Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="NFT Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="NFT" className="my-4" onChange={onChange} />
        {fileUrl && (
          <img
            alt="img"
            className="rounded mt-4 nft_preview"
            width="350"
            height="100"
            src={fileUrl}
          />
        )}
        <button onClick={createMarket} className="submit-btn">
          Create NFT
        </button>
      </div>
    </div>
  );
}
