// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './../api/IDateTime.sol';

contract MockDateTime is IDateTime {
    
    uint8 private _month;

    function mockSetMonth(uint8 month) public {
        _month = month;
    }

    function getMonth(uint) public view override returns (uint8) {
        return _month;
    }
}
