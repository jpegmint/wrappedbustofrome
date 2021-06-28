// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INiftyBuilderInstance {
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function tokenIPFSHash(uint256 tokenId) external view returns (string memory);
}
