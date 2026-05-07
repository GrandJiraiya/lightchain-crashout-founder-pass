// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title CrashOutFounderPass
/// @notice Simple capped ERC-721 founder pass for Crash Out ecosystem access.
/// @dev Mainnet-safe baseline: no upgrade proxy, no custom transfer tax, no hidden mint authority beyond owner controls.
contract CrashOutFounderPass is ERC721, Ownable, Pausable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public immutable maxSupply;
    uint256 public mintPriceWei;
    uint256 public maxMintPerTx = 5;

    uint256 private _nextTokenId = 1;
    string private _baseTokenUri;

    event BaseURIUpdated(string newBaseURI);
    event MintPriceUpdated(uint256 newMintPriceWei);
    event MaxMintPerTxUpdated(uint256 newMaxMintPerTx);
    event FounderPassMinted(address indexed to, uint256 indexed tokenId);
    event Withdrawn(address indexed recipient, uint256 amountWei);

    error InvalidMaxSupply();
    error InvalidQuantity();
    error ExceedsMaxMintPerTx();
    error ExceedsMaxSupply();
    error IncorrectPayment(uint256 expectedWei, uint256 actualWei);
    error WithdrawFailed();

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 mintPriceWei_,
        string memory baseTokenUri_,
        address initialOwner_
    ) ERC721(name_, symbol_) Ownable(initialOwner_) {
        if (maxSupply_ == 0) revert InvalidMaxSupply();

        maxSupply = maxSupply_;
        mintPriceWei = mintPriceWei_;
        _baseTokenUri = baseTokenUri_;
    }

    function totalMinted() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    function publicMint(uint256 quantity) external payable whenNotPaused nonReentrant {
        _validateMint(quantity);

        uint256 expectedPayment = mintPriceWei * quantity;
        if (msg.value != expectedPayment) {
            revert IncorrectPayment(expectedPayment, msg.value);
        }

        _mintBatch(msg.sender, quantity);
    }

    function ownerMint(address to, uint256 quantity) external onlyOwner {
        _validateMint(quantity);
        _mintBatch(to, quantity);
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenUri = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function setMintPriceWei(uint256 newMintPriceWei) external onlyOwner {
        mintPriceWei = newMintPriceWei;
        emit MintPriceUpdated(newMintPriceWei);
    }

    function setMaxMintPerTx(uint256 newMaxMintPerTx) external onlyOwner {
        if (newMaxMintPerTx == 0) revert InvalidQuantity();
        maxMintPerTx = newMaxMintPerTx;
        emit MaxMintPerTxUpdated(newMaxMintPerTx);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw(address payable recipient) external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = recipient.call{value: balance}("");
        if (!success) revert WithdrawFailed();
        emit Withdrawn(recipient, balance);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_baseURI(), tokenId.toString(), ".json");
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenUri;
    }

    function _validateMint(uint256 quantity) internal view {
        if (quantity == 0) revert InvalidQuantity();
        if (quantity > maxMintPerTx) revert ExceedsMaxMintPerTx();
        if (totalMinted() + quantity > maxSupply) revert ExceedsMaxSupply();
    }

    function _mintBatch(address to, uint256 quantity) internal {
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId;
            _nextTokenId++;
            _safeMint(to, tokenId);
            emit FounderPassMinted(to, tokenId);
        }
    }
}
