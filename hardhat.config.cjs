require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const {
  LIGHTCHAIN_MAINNET_RPC_URL,
  LIGHTCHAIN_MAINNET_CHAIN_ID,
  DEPLOYER_PRIVATE_KEY,
} = process.env;

const lightchainChainId = Number(LIGHTCHAIN_MAINNET_CHAIN_ID || 0);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    lightchainMainnet: {
      url: LIGHTCHAIN_MAINNET_RPC_URL || "http://127.0.0.1:8545",
      chainId: lightchainChainId || undefined,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    // Lightscan appears to be Blockscout-based. Verification config may need
    // adjustment once Lightchain publishes exact mainnet verifier/API details.
    apiKey: {
      lightchainMainnet: process.env.LIGHTSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "lightchainMainnet",
        chainId: lightchainChainId || 0,
        urls: {
          apiURL: "https://mainnet.lightscan.app/api",
          browserURL: "https://mainnet.lightscan.app",
        },
      },
    ],
  },
};
