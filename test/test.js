const axios = require('axios');
const { ethers } = require('hardhat');
const expect = require('chai').expect;

describe("NFTMarket", function() {
  it("Should interact with the token contract", async function() {

    const [owner, userAddress, userAddress2, userAddress3] =
      await ethers.getSigners();

    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy(owner.address);
    await market.deployed()
    const marketAddress = market.address; 

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed()
    const nftContractAddress = nft.address;

    await nft.createToken("a")
    await nft.createToken("b")
    await nft.createToken("c")
  
    await market.createMarketItem(nftContractAddress, 1, 1000, { value: ethers.utils.parseEther('0.01')})
    await market.createMarketItem(nftContractAddress, 2, 1000, { value: ethers.utils.parseEther('0.01')})
    await market.createMarketItem(nftContractAddress, 3, 1000, { value: ethers.utils.parseEther('0.01')})
    
    await market.connect(userAddress).createMarketSale(nftContractAddress, 1, { value: 1000})
    await market.connect(userAddress2).createMarketSale(nftContractAddress, 2, { value: 1000})
    await market.connect(userAddress2).createMarketSale(nftContractAddress, 3, { value: 1000})

    transaction = await nft.createToken("d")
    transaction = await nft.createToken("e")
    transaction = await nft.createToken("f")
    transaction = await nft.createToken("g")
    transaction = await nft.createToken("h")
    transaction = await nft.connect(userAddress2).createToken("i")

    await market.createMarketItem(nftContractAddress, 4, 1000, { value: ethers.utils.parseEther('0.01')})
    await market.createMarketItem(nftContractAddress, 5, 1000, { value: ethers.utils.parseEther('0.01')})
    await market.createMarketItem(nftContractAddress, 6, 1000, { value: ethers.utils.parseEther('0.01')})
    await market.createMarketItem(nftContractAddress, 7, 1000, { value: ethers.utils.parseEther('0.01')})
    await market.createMarketItem(nftContractAddress, 8, 1000, { value: ethers.utils.parseEther('0.01')})
    await market.connect(userAddress2).createMarketItem(nftContractAddress, 9, 1000, { value: ethers.utils.parseEther('0.01')})

    // lock item 5
    await market.lockNft(4);
    // expect(locked).equal(true);

    // ** await market.connect(userAddress2).createMarketSale(nftContractAddress, 4, { value: 1000}) // ! d - throws error (locked token)
    await market.connect(userAddress2).createMarketSale(nftContractAddress, 5, { value: 1000}) // e
    await market.connect(userAddress2).createMarketSale(nftContractAddress, 6, { value: 1000}) // f
    await market.connect(userAddress2).createMarketSale(nftContractAddress, 7, { value: 1000}) // g

    items = await market.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toNumber(),
        tokenId: i.price.toNumber(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)

    const myNfts = await market.connect(userAddress2).fetchMyNFTs()
    console.log('myNfts:', myNfts.length);
  });
});
