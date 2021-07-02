// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract BuilderMasterAPI {
   function getContractId(uint tokenId) public view virtual returns (uint);
   function getNiftyTypeId(uint tokenId) public view virtual returns (uint);
   function getSpecificNiftyNum(uint tokenId) public view virtual returns (uint);
   function encodeTokenId(uint contractId, uint niftyType, uint specificNiftyNum) public view virtual returns (uint);
   function strConcat(string memory _a, string memory _b) public view virtual returns (string memory);
   function uint2str(uint _i) public view virtual returns (string memory _uintAsString);
}
