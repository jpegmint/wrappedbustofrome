require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");

const { etherscanApiKey, alchemyApiKey, mnemonic, alchemyMainnetApiKey } = require('./secrets.json');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
      accounts: {mnemonic: mnemonic}
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyMainnetApiKey}`,
      accounts: {mnemonic: mnemonic}
    }
  },
  etherscan: {
    apiKey: etherscanApiKey
  }
};
