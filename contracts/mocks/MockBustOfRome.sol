// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../INiftyBuilder.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockBustOfRome is ERC721, INiftyBuilder {

    uint256 private _mockMonth;

    string[12] artifact = ["QmQdb77jfHZSwk8dGpN3mqx8q4N7EUNytiAgEkXrMPbMVw", //State 1
                           "QmS3kaQnxb28vcXQg35PrGarJKkSysttZdNLdZp3JquttQ", //State 2
                           "QmX8beRtZAsed6naFWqddKejV33NoXotqZoGTuDaV5SHqN", //State 3
                           "QmQvsAMYzJm8kGQ7YNF5ziWUb6hr7vqdmkrn1qEPDykYi4", //State 4
                           "QmZwHt9ZhCgVMqpcFDhwKSA3higVYQXzyaPqh2BPjjXJXU", //State 5
                           "Qmd2MNfgzPYXGMS1ZgdsiWuAkriRRx15pfRXU7ZVK22jce", //State 6
                           "QmWcYzNdUYbMzrM7bGgTZXVE4GBm7v4dQneKb9fxgjMdAX", //State 7
                           "QmaXX7VuBY1dCeK78TTGEvYLTF76sf6fnzK7TJSni4PHxj", //State 8
                           "QmaqeJnzF2cAdfDrYRAw6VwzNn9dY9bKTyUuTHg1gUSQY7", //State 9
                           "QmSZquD6yGy5QvsJnygXUnWKrsKJvk942L8nzs6YZFKbxY", //State 10
                           "QmYtdrfPd3jAWWpjkd24NzLGqH5TDsHNvB8Qtqu6xnBcJF", //State 11
                           "QmesagGNeyjDvJ2N5oc8ykBiwsiE7gdk9vnfjjAe3ipjx4"];//State 12
    
    constructor() ERC721('MockBustOfRome', 'mROME') {}

    function mockSetMonth(uint256 month) public {
        _mockMonth = month;
    }
    
    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function tokenIPFSHash(uint256 tokenId) external view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: IPFS hash query for nonexistent token");
        return artifact[_mockMonth];
    }
}
