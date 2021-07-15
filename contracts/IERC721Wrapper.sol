// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title ERC721 token wrapping interface.
 * @author jpegminting.xyz
 */
 interface IERC721Wrapper is IERC721Receiver, IERC165 {
    /**
     * @dev Emitted when `tokenId` token wrapped by `from`.
     */
    event Wrapped(address indexed from, uint256 tokenId);

    /**
     * @dev Emitted when `tokenId` token is unwrapped by `from`.
     */
    event Unwrapped(address indexed from, uint256 tokenId);

    /**
     * @dev Wraps `tokenId` by receiving token and minting matching token.
     * Emits a {Wrapped} event.
     */
    function wrap(uint256 tokenId) external;

    /**
     * @dev Unwraps `tokenId` by burning wrapped and returning original token.
     * Emits a {Unwrapped} event.
     */
    function unwrap(uint256 tokenId) external;

    /**
     * @dev Checks and returns whether the tokenId is wrappable.
     */
    function isWrappable(uint256 tokenId) external view returns (bool);

    /**
     * @dev Receives `tokenId` and mints matching token if valid request.
     * Emits a {Wrapped} event.
     */
    function onERC721Received(address, address from, uint256 tokenId, bytes calldata) external override returns (bytes4);
}
