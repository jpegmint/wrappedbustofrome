// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @dev NiftyBuilder interface stub for IPFS hash method.
 */
interface INiftyBuilder is IERC721 {
    function giftNifty(address collector_address) external;
    function tokenIPFSHash(uint256 tokenId) external view returns (string memory);
}
