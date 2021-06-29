// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./INiftyBuilderInstance.sol";
import "./IDateTimeAPI.sol";

contract WrappedBustOfRomeOneYear is ERC721, ERC721Enumerable, Pausable, Ownable {

    INiftyBuilderInstance private _niftyBuilderInstance;
    IDateTimeAPI private _dateTimeInstance;

    string[12] previews = [
        "iOKh8ppTX5831s9ip169PfcqZ265rlz_kH-oyDXELtA",  // State 1
        "4iJ3Igr90bfEkBMeQv1t2S4ctK2X-I18hnbal2YFfWI",  // State 2
        "y4yuf5VvfAYOl3Rm5DTsAaneJDXwFJGBThI6VG3b7co",  // State 3
        "29SOcovLFC5Q4B-YJzgisGgRXllDHoN_l5c8Tan3jHs",  // State 4
        "d8mJGLKJhg1Gl2OW1qQjcH8Y8tYBCvNWUuGH6iXd18U",  // State 5
        "siy0OInjmvElSk2ORJ4VNiQC1_dkdKzNRpmkOBBy2hA",  // State 6
        "5euBxS7JvRrqb7fxh4wLjEW5abPswocAGTHjqlrkyBE",  // State 7
        "7IK1u-DsuAj0nQzpwmQpo66dwpWx8PS9i-xv6aS6y6I",  // State 8
        "LWpLIs3-PUvV6WvXa-onc5QZ5FeYiEpiIwRfc_u64ss",  // State 9
        "iEh79QQjaMjKd0I6d6eM8UYcFw-pj5_gBdGhTOTB54g",  // State 10
        "vzLvsueGrzpVI_MZBogAw57Pi1OdynahcolZPpvhEQI",  // State 11
        "b132CTM45LOEMwzOqxnPqtDqlPPwcaQ0ztQ5OWhBnvQ"   // State 12
    ];

    event Wrapped(address indexed from, uint256 tokenId);
    event Unwrapped(address indexed from, uint256 tokenId);

    constructor(address niftyBuilderAddress, address dateTimeAddress) ERC721("Wrapped Bust of Rome (One Year) by Daniel Arsham", "wROME") {
        _niftyBuilderInstance = INiftyBuilderInstance(niftyBuilderAddress);
        _dateTimeInstance = IDateTimeAPI(dateTimeAddress);
    }

	function wrap(uint256 tokenId) public whenNotPaused {
		_safeMint(msg.sender, tokenId);
		_niftyBuilderInstance.safeTransferFrom(msg.sender, address(this), tokenId);
        emit Wrapped(msg.sender, tokenId);
	}

	function unwrap(uint256 tokenId) public whenNotPaused {
		require(ownerOf(tokenId) == msg.sender, "wROME: transfer of token that is not own");
		_burn(tokenId);
		_niftyBuilderInstance.safeTransferFrom(address(this), msg.sender, tokenId);
        emit Unwrapped(msg.sender, tokenId);
	}

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {

        require(_exists(tokenId), "wROME: URI query for nonexistent token");

        string memory imageHash = previews[_dateTimeInstance.getMonth(block.timestamp) - 1];
        string memory animationHash = _niftyBuilderInstance.tokenIPFSHash(tokenId);

        return string(abi.encodePacked(
            'data:application/json;utf8,{',
                '"name": "Eroding and Reforming Bust of Rome (One Year)",',
                '"description": "With his debut NFT release, Daniel Arsham introduces a concept never before seen on Nifty Gateway. His *Eroding and Reforming Bust of Rome (One Year)* piece will erode, reform, and change based on the time of year.",',
                '"created_by": "Daniel Arsham",',
                '"external_url": "https://niftygateway.com/collections/danielarsham",',
                '"background_color": "ffffff",',
                '"image": "https://arweave.net/', imageHash, '",',
                '"image_url": "https://arweave.net/', imageHash, '",',
                '"animation": "ipfs://', animationHash, '",',
                '"animation_url": "ipfs://', animationHash, '"',
            '}'
        ));
    }

	function onERC721Received(address, address, uint256, bytes calldata) external view returns (bytes4) {
		require(msg.sender == address(_niftyBuilderInstance), "wROME: unrecognized contract");
		return this.onERC721Received.selector;
	}

    function withdrawAll() public payable onlyOwner {
        require(payable(_msgSender()).send(address(this).balance));
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
