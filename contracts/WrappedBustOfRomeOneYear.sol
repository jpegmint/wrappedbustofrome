// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface INiftyBuilderInstance {
    function tokenIPFSHash(uint256 tokenId) external returns (string memory);
}

contract WrappedBustOfRomeOneYear is ERC721, ERC721Enumerable, Pausable, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    INiftyBuilderInstance public _niftyInstance;

    constructor(address niftyBuilderAddress) ERC721("Wrapped Bust of Rome (One Year)", "WBR1") {
        _niftyInstance = INiftyBuilderInstance(niftyBuilderAddress);
    }

    function safeMint(address to) public onlyOwner {
        _safeMint(to, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal whenNotPaused override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}