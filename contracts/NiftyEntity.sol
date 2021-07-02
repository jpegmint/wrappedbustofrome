// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './api/NiftyRegistryAPI.sol';

contract NiftyEntity {
   
    // 0xCA9fC51835DBB525BB6E6ebfcc67b8bE1b08BDfA
    address public immutable masterBuilderContract;
   
    // 0x33F8cb717384A96C2a5de7964d0c7c1a10777660
    address immutable niftyRegistryContract;
   
    modifier onlyValidSender() {
        NiftyRegistryAPI nftg_registry = NiftyRegistryAPI(niftyRegistryContract);
        bool is_valid = nftg_registry.isValidNiftySender(msg.sender);
        require(is_valid, "NiftyEntity: Invalid msg.sender");
        _;
    }

    constructor(address _masterBuilderContract, address _niftyRegistryContract) {
        masterBuilderContract = _masterBuilderContract;
        niftyRegistryContract = _niftyRegistryContract;
    }
}
