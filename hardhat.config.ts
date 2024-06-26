// import "@nomicfoundation/hardhat-foundry";
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import fs from "fs";
import { ethers } from "ethers";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "hardhat-deploy";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";

// extends hre with gmx domain data
import "./config";

// add test helper methods
import "./utils/test";

const getRpcUrl = (network) => {
  const defaultRpcs = {
    arbitrum: "https://arb1.arbitrum.io/rpc",
    avalanche: "https://api.avax.network/ext/bc/C/rpc",
    arbitrumGoerli: "https://goerli-rollup.arbitrum.io/rpc",
    avalancheFuji: "https://api.avax-test.network/ext/bc/C/rpc",
    snowtrace: "https://api.avax.network/ext/bc/C/rpc",
  };

  let rpc = defaultRpcs[network];

  const filepath = path.join("./.rpcs.json");
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath).toString());
    if (data[network]) {
      rpc = data[network];
    }
  }

  return rpc;
};

const getEnvAccounts = () => {
  const { ACCOUNT_KEY, ACCOUNT_KEY_FILE } = process.env;

  if (ACCOUNT_KEY) {
    return [ACCOUNT_KEY];
  }

  if (ACCOUNT_KEY_FILE) {
    const filepath = path.join("./keys/", ACCOUNT_KEY_FILE);
    const data = JSON.parse(fs.readFileSync(filepath));
    if (!data) {
      throw new Error("Invalid key file");
    }

    if (data.key) {
      return [data.key];
    }

    if (!data.mnemonic) {
      throw new Error("Invalid mnemonic");
    }

    const wallet = ethers.Wallet.fromMnemonic(data.mnemonic);
    return [wallet.privateKey];
  }

  return [];
};

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
            details: {
              constantOptimizer: true,
            },
          },
        },
      },
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 500,
            details: {
              constantOptimizer: true,
            },
          },
        },
      },
      {
        version: "0.6.12"
      }
    ],

  },
  paths: {
    sources: './contracts',
    cache: './cache',
    artifacts: './artifacts',
 },
  networks: {
    hardhat: {
      saveDeployments: true,
      allowUnlimitedContractSize: true,
      // forking: {
      //   url: 'https://rpc.coredao.org',
      //   // url: 'http://129.213.109.4:8579/', # https://rpc.coredao.org	
      //   // url: 'https://nlxrpc.up.railway.app/api/', # https://rpc.coredao.org	
      //   blockNumber: 0,
      //   enabled: true,
      // },
      // blockGasLimit:40_000_000,
      // gas:30000000000,
      // accounts: [{
      //   balance: "1000",
      //   privateKey: process.env.CORE_MAINNET_DEPLOYER
      // }],
    },
    ["core-mainnet"]: {
      url: 'https://nlxrpc.up.railway.app/api/',
      // url: 'https://193.122.158.161:8579/',
      // url: 'https://rpc.coredao.org',
      // url: 'https://1rpc.io/core',
      // url: 'https://rpc.ankr.com/core',
      accounts: [process.env.CORE_MAINNET_DEPLOYER],
      chainId: 1116,
    },
    ["core-testnet"]: {
      url: 'https://rpc.test.btcs.network',
      accounts: [process.env.CORE_TESTNET_DEPLOYER],
      chainId: 1115,
    },
    // arbFork: {
    //   url: 'https://rpc.tenderly.co/fork/e7050279-42e2-4287-81b7-91fe80a02c8c',
    //   accounts: [process.env.CORE_TESTNET_DEPLOYER],
    //   chainId: 42161,
    // },
    polygonFork: {
      url: 'https://rpc.tenderly.co/fork/1bc4953d-dd23-489b-8bf6-cb97af414cef',
      accounts: [process.env.CORE_TESTNET_DEPLOYER],
      chainId: 137,
    },
    localhost: {
      saveDeployments: true,
      blockGasLimit:40_000_000,
      gas:30000000000,
      allowUnlimitedContractSize: true,

    },
    arbitrum: {
      url: getRpcUrl("arbitrum"),
      chainId: 42161,
      accounts: getEnvAccounts(),
      verify: {
        etherscan: {
          apiUrl: "https://api.arbiscan.io/",
          apiKey: process.env.ARBISCAN_API_KEY,
        },
      },
      blockGasLimit: 20_000_000,
    },
    avalanche: {
      url: getRpcUrl("avalanche"),
      chainId: 43114,
      accounts: getEnvAccounts(),
      gasPrice: 200000000000,
      verify: {
        etherscan: {
          apiUrl: "https://api.snowtrace.io/",
          apiKey: process.env.SNOWTRACE_API_KEY,
        },
      },
      blockGasLimit: 15_000_000,
    },
    snowtrace: {
      url: getRpcUrl("snowtrace"),
      accounts: getEnvAccounts(),
    },
    arbitrumGoerli: {
      url: getRpcUrl("arbitrumGoerli"),
      chainId: 421613,
      accounts: getEnvAccounts(),
      verify: {
        etherscan: {
          apiUrl: "https://api-goerli.arbiscan.io/",
          apiKey: process.env.ARBISCAN_API_KEY,
        },
      },
      blockGasLimit: 10000000,
    },
    avalancheFuji: {
      url: getRpcUrl("avalancheFuji"),
      chainId: 43113,
      accounts: getEnvAccounts(),
      verify: {
        etherscan: {
          apiUrl: "https://api-testnet.snowtrace.io/",
          apiKey: process.env.SNOWTRACE_API_KEY,
        },
      },
      blockGasLimit: 2500000,
      // gasPrice: 50000000000,
    },
  },
  // hardhat-deploy has issues with some contracts
  // https://github.com/wighawag/hardhat-deploy/issues/264
  etherscan: {
    apiKey: {
      // hardhat-etherscan plugin uses "avalancheFujiTestnet" name
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      avalanche: process.env.SNOWTRACE_API_KEY,
      arbitrumGoerli: process.env.ARBISCAN_API_KEY,
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY,
      snowtrace: "snowtrace", // apiKey is not required, just set a placeholder
      "core-testnet": process.env.CORE_TESTNET_API_KEY,
      // arbFork: process.env.CORE_TESTNET_API_KEY,
      // polygonFork: process.env.CORE_TESTNET_API_KEY,
      "core-mainnet": process.env.CORE_MAINNET_API_KEY,
    },
    customChains: [
      {
        network: "snowtrace",
        chainId: 43114,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan",
          browserURL: "https://avalanche.routescan.io",
        },
      },
      {
        network: "core-testnet",
        chainId: 1115,
        urls: {
          apiURL: "https://api.test.btcs.network/api",
          browserURL: "https://scan.test.btcs.network/"
        }
      },
      {
        network: "core-mainnet",
        chainId: 1116,
        urls: {
          apiURL: "https://openapi.coredao.org/api",
          browserURL: "https://scan.coredao.org/"
        }
      }
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
  },
  namedAccounts: {
    deployer: 0,
  },
  mocha: {
    timeout: 100000000,
  },
};

export default config;
