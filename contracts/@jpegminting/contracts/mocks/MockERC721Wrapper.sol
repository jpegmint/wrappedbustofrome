// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author jpegminting.xyz

import "../ERC721Wrapper.sol";

contract MockERC721Wrapper is ERC721Wrapper {
    
    constructor() ERC721("MockERC721Wrapper", "wMOCK") {}

    function updateApprovedTokenRanges(address contract_, uint256 minTokenId, uint256 maxTokenId) public override {
        _updateApprovedTokenRanges(contract_, minTokenId, maxTokenId);
    }
}
