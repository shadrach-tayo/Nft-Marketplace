import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

export const web3context = React.createContext();

export const Web3ContextProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(false);
  const [_web3Modal, setWeb3Modal] = useState();
  const [address, setAddress] = useState('');
  const [disconnect, setDisconnect] = useState(true);

  useEffect(() => {
    if (!connected || !provider && !disconnect) connect();
  });

  async function connect() {
    try {
      if (connected) return;

      const web3modal = new Web3Modal({
        network: "rinkeby",
        cacheProvider: true,
      });
      setWeb3Modal(web3modal)
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
      const address = await signer.getAddress();
      setAddress(address);
      setSigner(signer);
      setProvider(provider);
      setConnected(true);
      setDisconnect(false);

       provider.on("accountsChanged", async () => {
         console.log(`account changed!`);
         setProvider(new ethers.providers.Web3Provider(provider));
         const signer = await provider.getSigner();
         setSigner(signer);
       });

    } catch (e) {
      console.log("web3 connection error: ", e);
      setError(true);
    }
  }

  async function logout() {
    // setDisconnect(true);
    // setConnected(false);
  }

  return (
    <web3context.Provider
      value={{ provider, signer, error, connect, connected, disconnect: logout, address }}
    >
      {children}
    </web3context.Provider>
  );
};
