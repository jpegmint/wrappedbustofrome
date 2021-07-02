// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 *  Abstract contract for interfacing with the DateTime contract.
 */
abstract contract DateTimeAPI {
    function isLeapYear(uint16 year) public view virtual returns (bool);
    function getYear(uint timestamp) public view virtual returns (uint16);
    function getMonth(uint timestamp) public view virtual returns (uint8);
    function getDay(uint timestamp) public view virtual returns (uint8);
    function getHour(uint timestamp) public view virtual returns (uint8);
    function getMinute(uint timestamp) public view virtual returns (uint8);
    function getSecond(uint timestamp) public view virtual returns (uint8);
    function getWeekday(uint timestamp) public view virtual returns (uint8);
    function toTimestamp(uint16 year, uint8 month, uint8 day) public view virtual returns (uint timestamp);
    function toTimestamp(uint16 year, uint8 month, uint8 day, uint8 hour) public view virtual returns (uint timestamp);
    function toTimestamp(uint16 year, uint8 month, uint8 day, uint8 hour, uint8 minute) public view virtual returns (uint timestamp);
    function toTimestamp(uint16 year, uint8 month, uint8 day, uint8 hour, uint8 minute, uint8 second) public view virtual returns (uint timestamp);
}
