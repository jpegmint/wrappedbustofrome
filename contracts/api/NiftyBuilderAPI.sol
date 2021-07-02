// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract NiftyBuilderAPI {
    function ownerOf(uint256 tokenId) public view virtual returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external virtual;
    function safeTransferFrom(address from, address to, uint256 tokenId) external virtual;
    function tokenIPFSHash(uint256 tokenId) external virtual view returns (string memory);
}
