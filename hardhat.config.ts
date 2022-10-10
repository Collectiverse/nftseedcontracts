require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");
require('@openzeppelin/hardhat-upgrades');

const { TEST_KEY } = process.env;

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
    // MAINNETS
    avax: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: [TEST_KEY || ""]
    },
    bsc: {
      url: "https://1rpc.io/bnb",
      accounts: [TEST_KEY || ""]
    },
    eth: {
      url: "https://rpc.ankr.com/eth",
      accounts: [TEST_KEY || ""]
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [TEST_KEY || ""]
    },
    // TESTNETS
    "avax-fuji": {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [TEST_KEY || ""]
    },
    "bsc-testnet": {
      url: "https://data-seed-prebsc-1-s2.binance.org:8545",
      accounts: [TEST_KEY || ""]
    },
    "eth-sepolia": {
      url: "https://rpc.sepolia.org",
      accounts: [TEST_KEY || ""]
    },
    "polygon-mumbai": {
      url: "https://polygon-testnet.public.blastapi.io",
      accounts: [TEST_KEY || ""]
    },
    // LOCAL NODE
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