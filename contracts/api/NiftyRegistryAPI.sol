// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract NiftyRegistryAPI {
   function isValidNiftySender(address sending_key) public view virtual returns (bool);
   function isOwner(address owner_key) public view virtual returns (bool);
}
