// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./api/INiftyBuilder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract WrappedBustOfRomeOneYear is ERC721, IERC721Receiver, ERC721Enumerable, AccessControl, ReentrancyGuard {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant APPROVED_TOKENID_MIN = 100010001;
    uint256 public constant APPROVED_TOKENID_MAX = 100010671;

    string private _ipfsGatewayUri;
    string private _arweaveGatewayUri;
    mapping(string => string) private _ipfsToArweaveIndex;
    INiftyBuilder private immutable _niftyBuilderInstance;

    event TokenWrapped(address indexed from, uint256 tokenId);
    event TokenUnwrapped(address indexed from, uint256 tokenId);

    constructor(address niftyBuilderAddress) ERC721("Wrapped Bust of Rome (One Year) by Daniel Arsham", "wROME") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);

        setIpfsGatewayUri('ipfs://');
        setArweaveGatewayUri('https://arweave.net/');
        _niftyBuilderInstance = INiftyBuilder(niftyBuilderAddress);

        _ipfsToArweaveIndex["QmQdb77jfHZSwk8dGpN3mqx8q4N7EUNytiAgEkXrMPbMVw"] = "iOKh8ppTX5831s9ip169PfcqZ265rlz_kH-oyDXELtA"; //State 1
        _ipfsToArweaveIndex["QmS3kaQnxb28vcXQg35PrGarJKkSysttZdNLdZp3JquttQ"] = "4iJ3Igr90bfEkBMeQv1t2S4ctK2X-I18hnbal2YFfWI"; //State 2
        _ipfsToArweaveIndex["QmX8beRtZAsed6naFWqddKejV33NoXotqZoGTuDaV5SHqN"] = "y4yuf5VvfAYOl3Rm5DTsAaneJDXwFJGBThI6VG3b7co"; //State 3
        _ipfsToArweaveIndex["QmQvsAMYzJm8kGQ7YNF5ziWUb6hr7vqdmkrn1qEPDykYi4"] = "29SOcovLFC5Q4B-YJzgisGgRXllDHoN_l5c8Tan3jHs"; //State 4
        _ipfsToArweaveIndex["QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU"] = "d8mJGLKJhg1Gl2OW1qQjcH8Y8tYBCvNWUuGH6iXd18U"; //State 5
        _ipfsToArweaveIndex["Qmd2MNfgzPYXGMS1ZgdsiWuAkriRRx15pfRXU7ZVK22jce"] = "siy0OInjmvElSk2ORJ4VNiQC1_dkdKzNRpmkOBBy2hA"; //State 6
        _ipfsToArweaveIndex["QmWcYzNdUYbMzrM7bGgTZXVE4GBm7v4dQneKb9fxgjMdAX"] = "5euBxS7JvRrqb7fxh4wLjEW5abPswocAGTHjqlrkyBE"; //State 7
        _ipfsToArweaveIndex["QmaXX7VuBY1dCeK78TTGEvYLTF76sf6fnzK7TJSni4PHxj"] = "7IK1u-DsuAj0nQzpwmQpo66dwpWx8PS9i-xv6aS6y6I"; //State 8
        _ipfsToArweaveIndex["QmaqeJnzF2cAdfDrYRAw6VwzNn9dY9bKTyUuTHg1gUSQY7"] = "LWpLIs3-PUvV6WvXa-onc5QZ5FeYiEpiIwRfc_u64ss"; //State 9
        _ipfsToArweaveIndex["QmSZquD6yGy5QvsJnygXUnWKrsKJvk942L8nzs6YZFKbxY"] = "vzLvsueGrzpVI_MZBogAw57Pi1OdynahcolZPpvhEQI"; //State 10
        _ipfsToArweaveIndex["QmYtdrfPd3jAWWpjkd24NzLGqH5TDsHNvB8Qtqu6xnBcJF"] = "iEh79QQjaMjKd0I6d6eM8UYcFw-pj5_gBdGhTOTB54g"; //State 11
        _ipfsToArweaveIndex["QmesagGNeyjDvJ2N5oc8ykBiwsiE7gdk9vnfjjAe3ipjx4"] = "b132CTM45LOEMwzOqxnPqtDqlPPwcaQ0ztQ5OWhBnvQ"; //State 12
    }

    /**
     * @dev Transfers ROME token into wrap contract and issues wROME token.
     */
	function wrap(uint256 tokenId) external nonReentrant {
        require(hasRole(MINTER_ROLE, msg.sender), 'wROME: Caller not authorized to wrap.');
        require(_niftyBuilderInstance.ownerOf(tokenId) == msg.sender, 'wROME: Caller must own NFTs');
        require(_niftyBuilderInstance.getApproved(tokenId) == address(this), 'wROME: Contract must be given approval to wrap NFT.');
        require(tokenId >= APPROVED_TOKENID_MIN && tokenId <= APPROVED_TOKENID_MAX, 'wROME: Unrecognized tokenId.');

		_niftyBuilderInstance.transferFrom(msg.sender, address(this), tokenId);
        _mintWrapped(msg.sender, tokenId);
	}

    /**
     * @dev Burn wROME token and transfer original ROME back to sender.
     */
	function unwrap(uint256 tokenId) external nonReentrant {
		require(msg.sender == ownerOf(tokenId), "wROME: Caller does not wrapped token.");
		_burn(tokenId);
		_niftyBuilderInstance.safeTransferFrom(address(this), msg.sender, tokenId);
        emit TokenUnwrapped(msg.sender, tokenId);
	}

    /**
     * @dev Receives ROME token and mints wROME token back to sender.
     */
	function onERC721Received(address, address from, uint256 tokenId, bytes calldata) external override nonReentrant returns (bytes4) {
        require(hasRole(MINTER_ROLE, from), 'wROME: Caller not authorized to wrap.');
        require(msg.sender == address(_niftyBuilderInstance), "wROME: Unrecognized contract.");
        require(tokenId >= APPROVED_TOKENID_MIN && tokenId <= APPROVED_TOKENID_MAX, 'wROME: unrecognized tokenId');

        _mintWrapped(from, tokenId);
		return this.onERC721Received.selector;
	}

    /**
     * @dev Mints wROME token.
     */
    function _mintWrapped(address to, uint256 tokenId) internal {
		_safeMint(to, tokenId);
        emit TokenWrapped(to, tokenId);
    }

    /**
     * @dev TokenURI override to return metadata and IPFS/Arweave assets on-chain and dynamically.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {

        require(_exists(tokenId), "wROME: URI query for nonexistent token");

        bytes memory byteString;
        string memory mintNumber = (tokenId - 100010000).toString();
        string memory tokenHash = _niftyBuilderInstance.tokenIPFSHash(tokenId);
        string memory imageUri = string(abi.encodePacked(_arweaveGatewayUri, _ipfsToArweaveIndex[tokenHash]));
        string memory animationUri = string(abi.encodePacked(_ipfsGatewayUri, tokenHash));

        byteString = abi.encodePacked(byteString, 'data:application/json;utf8,{');
        byteString = abi.encodePacked(byteString, '"name": "Eroding and Reforming Bust of Rome (One Year) #', mintNumber, '/671",');
        byteString = abi.encodePacked(byteString, '"created_by": "Daniel Arsham",');
        byteString = abi.encodePacked(byteString, '"description": "**Daniel Arsham** (b. 1980)\\n***Eroding and Reforming Bust of Rome (One Year)***, 2021\\n\\nWith his debut NFT release, Daniel Arsham introduces a concept never before seen on Nifty Gateway. His *Eroding and Reforming Bust of Rome (One Year)* piece will erode, reform, and change based on the time of year.",');
        byteString = abi.encodePacked(byteString, '"external_url": "https://niftygateway.com/collections/danielarsham",');
        byteString = abi.encodePacked(byteString, '"image": "', imageUri, '",', '"image_url": "', imageUri, '",');
        byteString = abi.encodePacked(byteString, '"animation": "', animationUri, '",', '"animation_url": "', animationUri, '",');
        byteString = abi.encodePacked(byteString, '"attributes":[{"trait_type": "Edition", "display_type": "number", "value": ', mintNumber, ', "max_value": 671}]');
        byteString = abi.encodePacked(byteString, '}');
        
        return string(byteString);
    }

    /** Configurable IPFS Gateway URI to serve files. */
    function setIpfsGatewayUri(string memory gatewayUri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _ipfsGatewayUri = gatewayUri;
    }

    /** Configurable Arewave gateway to serve image preview files. */
    function setArweaveGatewayUri(string memory gatewayUri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _arweaveGatewayUri = gatewayUri;
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

    /// Override Boilerplate ///
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
