// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./INiftyBuilderInstance.sol";

contract WrappedBustOfRomeOneYear is ERC721, ERC721Enumerable, Pausable, Ownable {

    INiftyBuilderInstance public _niftyBuilderInstance;

    constructor(address niftyBuilderAddress) ERC721("Wrapped Bust of Rome (One Year)", "WBR1") {
        _niftyBuilderInstance = INiftyBuilderInstance(niftyBuilderAddress);
    }

	function wrap(uint256 tokenId) public whenNotPaused {
        
		_safeMint(msg.sender, tokenId);
		_niftyBuilderInstance.safeTransferFrom(msg.sender, address(this), tokenId);
	}

	function unwrap(uint256 tokenId) public whenNotPaused {

		require(ownerOf(tokenId) == msg.sender, "WBR1: transfer of token that is not own");
		_burn(tokenId);
		_niftyBuilderInstance.safeTransferFrom(address(this), msg.sender, tokenId);
	}

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {

        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        return string(abi.encodePacked(
            'data:application/json;utf8,{',
                '"name": "Eroding and Reforming Bust of Rome (One Year)",',
                '"description": "With his debut NFT release, Daniel Arsham introduces a concept never before seen on Nifty Gateway. His *Eroding and Reforming Bust of Rome (One Year)* piece will erode, reform, and change based on the time of year.",',
                '"external_url": "https://niftygateway.com/collections/danielarsham",',
                '"animation_url": "ipfs://', _niftyBuilderInstance.tokenIPFSHash(tokenId), '"',
            '}'
        ));
    }

	function onERC721Received(address, address, uint256, bytes calldata) external view returns (bytes4) {

		require(msg.sender == address(_niftyBuilderInstance), "WBR1: unrecognized contract");
		return this.onERC721Received.selector;
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
