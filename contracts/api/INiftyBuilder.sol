// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INiftyBuilder is IERC721 {
    function tokenIPFSHash(uint256 tokenId) external view returns (string memory);
}
