import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Web3Modal from "web3modal";

export const useWeb3React = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!connected || !provider) connect();
  });

  async function connect() {
    try {

      const web3modal = new Web3Modal({
        network: "localhost",
        cacheProvider: true,
      });
      const connection = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = await provider.getSigner();
      console.log('network: ', await signer.getChainId())
      setSigner(signer);
      setProvider(provider);
      setConnected(true);
      console.log('connected ');
    } catch (e) {
      console.log('web3 connection error: ', e);
      setError(true)
    }
  }

  return { provider, signer, connected, connect, error };
};
