// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./api/DateTimeAPI.sol";
import "./api/NiftyBuilderAPI.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract WrappedBustOfRomeOneYear is ERC721, ERC721Holder, ERC721Enumerable, Pausable, Ownable {

    NiftyBuilderAPI private _niftyBuilderInstance;
    DateTimeAPI private _dateTimeInstance;

    string private _arweaveGatewayUri;
    string private _ipfsGatewayUri;

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
        
        _arweaveGatewayUri = 'https://arweave.net/';
        _ipfsGatewayUri = 'ipfs://';
        _niftyBuilderInstance = NiftyBuilderAPI(niftyBuilderAddress);
        _dateTimeInstance = DateTimeAPI(dateTimeAddress);
    }

    /** Configurable IPFS Gateway URI to serve animation files. */
    function setIpfsGatewayUri(string memory gatewayUri) external onlyOwner {
        _ipfsGatewayUri = gatewayUri;
    }

    /** Configurable Arewave gateway to serve image preview files. */
    function setArweaveGatewayUri(string memory gatewayUri) external onlyOwner {
        _arweaveGatewayUri = gatewayUri;
    }

    /** Configurable contract address for DateTime. */ 
    function setDateTimeContract(address dateTimeAddress) public onlyOwner {
        _dateTimeInstance = DateTimeAPI(dateTimeAddress);
    }

    /**
     * TokenURI override to return IPFS/Arweave assets dynamically.
     */
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
                '"image": "', _arweaveGatewayUri, imageHash, '",',
                '"image_url": "', _arweaveGatewayUri, imageHash, '",',
                '"animation": "', _ipfsGatewayUri, animationHash, '",',
                '"animation_url": "', _ipfsGatewayUri, animationHash, '"',
            '}'
        ));
    }

	function wrap(uint256 tokenId) public whenNotPaused {
		_niftyBuilderInstance.safeTransferFrom(msg.sender, address(this), tokenId);
	}

	function unwrap(uint256 tokenId) public whenNotPaused {
		require(ownerOf(tokenId) == msg.sender, "wROME: transfer of token that is not own");
		_burn(tokenId);
		_niftyBuilderInstance.safeTransferFrom(address(this), msg.sender, tokenId);
        emit Unwrapped(msg.sender, tokenId);
	}

	function onERC721Received(address, address from, uint256 tokenId, bytes calldata) public whenNotPaused override returns (bytes4) {
		require(msg.sender == address(_niftyBuilderInstance), "wROME: unrecognized contract");
		_safeMint(from, tokenId);
        emit Wrapped(from, tokenId);
		return this.onERC721Received.selector;
	}

    /**
     * Recovery function to extract orphaned ROME tokens. Works only if wROME contract owns ROME token
     * that wasn't wrapped successfully.
     */
    function recoverOprhanedToken(uint256 tokenId) public onlyOwner {
        require(!_exists(tokenId), "wRome: can't recover a wrapped token");
        require(_niftyBuilderInstance.ownerOf(tokenId) == address(this), "wRome: can't recover token that is not own");
        _niftyBuilderInstance.safeTransferFrom(address(this), msg.sender, tokenId);
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
