require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const SHARDEUM_RPC = process.env.SHARDEUM_RPC_URL || "https://sphinx.shardeum.org/";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Shardeum Sphinx Testnet
    shardeum_sphinx: {
      url: SHARDEUM_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 8082,
    },
    // Local Hardhat node for testing
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    hardhat: {},
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
