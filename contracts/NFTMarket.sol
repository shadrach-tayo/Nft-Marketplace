// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool locked;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    address payable owner;
    uint256 public listingPrice = 0.01 ether;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price
    );

    event MarketItemLocked(
        uint256 indexed itemId,
        uint256 tokenId,
        address indexed nftContract,
        address indexed seller,
        bool locked
    );

    event MarketItemUnLocked(
        uint256 indexed itemId,
        uint256 tokenId,
        address indexed nftContract,
        address indexed seller,
        bool locked
    );

    constructor(address _owner) {
        owner = payable(_owner);
    }

    function getMarketItem(uint256 marketItemId)
        public
        view
        returns (MarketItem memory)
    {
        return idToMarketItem[marketItemId];
    }

    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value >= listingPrice, "You must include listing fee");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        payable(owner).transfer(msg.value);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price
        );
    }

    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        require(itemId <= _itemIds.current(), "Invalid tokenId");
        require(
            idToMarketItem[itemId].locked == false,
            "Token has been locked by the owner!!!"
        );
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        idToMarketItem[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        _itemsSold.increment();
    }

    function fetchMarketItem(uint256 itemId)
        public
        view
        returns (MarketItem memory)
    {
        MarketItem memory item = idToMarketItem[itemId];
        return item;
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                idToMarketItem[i + 1].owner == msg.sender ||
                (idToMarketItem[i + 1].seller == msg.sender &&
                    idToMarketItem[i + 1].owner == address(0))
            ) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                idToMarketItem[i + 1].owner == msg.sender ||
                (idToMarketItem[i + 1].seller == msg.sender &&
                    idToMarketItem[i + 1].owner == address(0))
            ) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function lockNft(uint256 marketItemId) public returns (bool) {
        require(
            idToMarketItem[marketItemId].seller == msg.sender,
            "You are not authorized to lock this nft"
        );
        require(
            idToMarketItem[marketItemId].owner == address(0),
            "Item cannot be locked"
        );
        
        idToMarketItem[marketItemId].locked = true;
        MarketItem storage item = idToMarketItem[marketItemId];
        emit MarketItemLocked(
            item.itemId,
            item.tokenId,
            item.nftContract,
            item.seller,
            item.locked
        );

        return true;
    }

    function unlockNft(uint256 marketItemId) public returns (bool) {
        require(
            idToMarketItem[marketItemId].seller == msg.sender,
            "You are not authorized to lock this nft"
        );
        require(
            idToMarketItem[marketItemId].owner == address(0),
            "Item cannot be unlocked"
        );
       idToMarketItem[marketItemId].locked = false;
       MarketItem storage item = idToMarketItem[marketItemId];
        emit MarketItemLocked(
            item.itemId,
            item.tokenId,
            item.nftContract,
            item.seller,
            item.locked
        );

        return true;
    }
}
