// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author jpegminting.xyz

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC721 is ERC721, Ownable {
    
    constructor() ERC721("MockERC721", "MOCK") {}

    function mint(address to, uint256 tokenId) public onlyOwner {
        _mint(to, tokenId);
    }
}
