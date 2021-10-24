// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // write the deploy script here
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await NFTMarket.deploy(
    "0x114EA4c82a0B5d54Ce5697272a2De2e4a14D654C"
  );
  await nftMarket.deployed();
  console.log("nftMarket deployed to : ", nftMarket.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("nft deployed to : ", nft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
