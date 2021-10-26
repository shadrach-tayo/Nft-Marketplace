import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

export const web3context = React.createContext();

export const Web3ContextProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!connected || !provider) connect();
  });

  async function connect() {
    try {
      if (connected) return;

      const web3modal = new Web3Modal({
        network: "localhost",
        cacheProvider: true,
      });
      const connection = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = await provider.getSigner();
      const balance = await signer.getBalance();
      
      // console.log(
      //   "network: ",
      //   await signer.getChainId(),
      //   await signer.getAddress(),
      //   ethers.utils.formatUnits(balance.toString(), 'ether')
      // );
      setSigner(signer);
      setProvider(provider);
      setConnected(true);
    } catch (e) {
      console.log("web3 connection error: ", e);
      setError(true);
    }
  }

  return (
    <web3context.Provider
      value={{ signer, error, connect, connected, provider }}
    >
      {children}
    </web3context.Provider>
  );
};
