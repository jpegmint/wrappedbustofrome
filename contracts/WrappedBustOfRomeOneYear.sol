// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./api/DateTimeAPI.sol";
import "./api/NiftyBuilderAPI.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract WrappedBustOfRomeOneYear is ERC721, IERC721Receiver, ERC721Enumerable, AccessControl, ReentrancyGuard {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string private _arweaveGatewayUri = 'https://arweave.net/';
    string private _ipfsGatewayUri = 'ipfs://';
    DateTimeAPI private _dateTimeInstance;
    NiftyBuilderAPI private immutable _niftyBuilderInstance;

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

    event TokenWrapped(address indexed from, uint256 tokenId);
    event TokenUnwrapped(address indexed from, uint256 tokenId);

    constructor(address niftyBuilderAddress, address dateTimeAddress) ERC721("Wrapped Bust of Rome (One Year) by Daniel Arsham", "wROME") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        setDateTimeContract(dateTimeAddress);
        _niftyBuilderInstance = NiftyBuilderAPI(niftyBuilderAddress);
    }

	function wrap(uint256 tokenId) public onlyRole(MINTER_ROLE) nonReentrant {
		_niftyBuilderInstance.safeTransferFrom(msg.sender, address(this), tokenId);
	}

	function unwrap(uint256 tokenId) public nonReentrant {
		require(msg.sender == ownerOf(tokenId), "wROME: transfer of token that is not own");
		_burn(tokenId);
		_niftyBuilderInstance.safeTransferFrom(address(this), msg.sender, tokenId);
        emit TokenUnwrapped(msg.sender, tokenId);
	}

	function onERC721Received(address, address from, uint256 tokenId, bytes calldata) public override nonReentrant returns (bytes4) {
		require(msg.sender == address(_niftyBuilderInstance), "wROME: unrecognized contract");
		_safeMint(from, tokenId);
        emit TokenWrapped(from, tokenId);
		return this.onERC721Received.selector;
	}

    /**
     * TokenURI override to return IPFS/Arweave assets on-chain and dynamically.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {

        require(_exists(tokenId), "wROME: URI query for nonexistent token");

        uint8 month =_dateTimeInstance.getMonth(block.timestamp) - 1;
        string memory imageUri = string(abi.encodePacked(_arweaveGatewayUri, previews[month]));
        string memory animationUri = string(abi.encodePacked(_ipfsGatewayUri, _niftyBuilderInstance.tokenIPFSHash(tokenId)));

        return string(abi.encodePacked(
            'data:application/json;utf8,{',
                '"name": "Eroding and Reforming Bust of Rome (One Year)",',
                '"description": "With his debut NFT release, Daniel Arsham introduces a concept never before seen on Nifty Gateway. His *Eroding and Reforming Bust of Rome (One Year)* piece will erode, reform, and change based on the time of year.",',
                '"external_url": "https://niftygateway.com/collections/danielarsham",',
                '"image": "', imageUri, '",',
                '"animation_url": "', animationUri, '"',
            '}'
        ));
    }

    /** Configurable IPFS Gateway URI to serve animation files. */
    function setIpfsGatewayUri(string memory gatewayUri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _ipfsGatewayUri = gatewayUri;
    }

    /** Configurable Arewave gateway to serve image preview files. */
    function setArweaveGatewayUri(string memory gatewayUri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _arweaveGatewayUri = gatewayUri;
    }

    /** Configurable contract address for DateTime. */ 
    function setDateTimeContract(address contractAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _dateTimeInstance = DateTimeAPI(contractAddress);
    }

    /**
     * Recovery function to extract orphaned ROME tokens. Works only if wROME contract
     * owns unwrapped ROME token.
     */
    function recoverOrphanedToken(uint256 tokenId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!_exists(tokenId), "wROME: can't recover wrapped token");
        require(_niftyBuilderInstance.ownerOf(tokenId) == address(this), "wROME: can't recover token that is not own");
        _niftyBuilderInstance.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
