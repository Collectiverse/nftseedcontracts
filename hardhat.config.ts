require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");
require('@openzeppelin/hardhat-upgrades');

const { PRIVATE_KEY, TEST_KEY, FUJI_URL } = process.env;

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    fuji: {
      url: FUJI_URL || "",
      accounts: [TEST_KEY || ""]
    },
    avax: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: [TEST_KEY || ""]
    },
    "bsc-testnet": {
      url: "https://data-seed-prebsc-1-s2.binance.org:8545",
      accounts: [TEST_KEY || ""]
    },
    hardhat: {
      chainId: 43114,
      gasPrice: 225000000000,
      throwOnTransactionFailures: true,
      loggingEnabled: false,
      accounts: [{
        privateKey: TEST_KEY || "",
        balance: "1000000000000000000000",
      }],
      forking: {
        url: "https://api.avax.network/ext/bc/C/rpc",
        enabled: true
      },
    }
  }
};

export default config;