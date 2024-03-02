import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TOKEN_ORACLE_TYPES } from "../utils/oracle";
import { decimalToFloat } from "../utils/math";
import { BigNumberish } from "ethers";

type OracleRealPriceFeed = {
  address: string;
  priceFeedId: string,
  decimals: number;
  heartbeatDuration: number;
  expo: number;
  stablePrice?: number;
  deploy?: never;
  initPrice?: never;
};

type OracleTestPriceFeed = {
  address?: never;
  decimals: number;
  priceFeedId: string,
  expo: number;
  heartbeatDuration: number;
  stablePrice?: number;
  deploy: true;
  initPrice: string;
};

type OraclePriceFeed = OracleRealPriceFeed | OracleTestPriceFeed;

export type OracleConfig = {
  pyth: string;
  signers: string[];
  minOracleSigners: number;
  minOracleBlockConfirmations: number;
  maxOraclePriceAge: number;
  maxRefPriceDeviationFactor: BigNumberish;
  tokens?: {
    [tokenSymbol: string]: {
      priceFeed?: OraclePriceFeed;
      oracleType?: string;
    };
  };
};

export default async function (hre: HardhatRuntimeEnvironment): Promise<OracleConfig> {
  const network = hre.network;

  let testSigners: string[];
  if (!network.live) {
    testSigners = (await hre.ethers.getSigners()).slice(10).map((signer) => signer.address);
  }

  const config: { [network: string]: OracleConfig } = {
    localhost: {
      pyth: ethers.constants.AddressZero,
      signers: testSigners,
      minOracleSigners: 0,
      minOracleBlockConfirmations: 255,
      maxOraclePriceAge: 60 * 60 * 24,
      maxRefPriceDeviationFactor: decimalToFloat(5, 1), // 50%
    },

    hardhat: {
      pyth: ethers.constants.AddressZero,
      signers: testSigners,
      minOracleSigners: 0,
      minOracleBlockConfirmations: 255,
      maxOraclePriceAge: 60 * 60,
      maxRefPriceDeviationFactor: decimalToFloat(5, 1), // 50%
      tokens: {
        USDC: {
          priceFeed: {
            decimals: 8,
            priceFeedId: "",
            expo: -5,
            heartbeatDuration: 24 * 60 * 60,
            deploy: true,
            initPrice: "100000000",
          },
        },
        USDT: {
          priceFeed: {
            decimals: 8,
            priceFeedId: "",
            expo: -5,
            heartbeatDuration: 24 * 60 * 60,
            deploy: true,
            initPrice: "100000000",
          },
        },
        WETH: {
          priceFeed: {
            decimals: 8,
            priceFeedId: "",
            expo: -5,
            heartbeatDuration: 24 * 60 * 60,
            deploy: true,
            initPrice: "500000000000",
          },
        },
        
        WBTC: {
          priceFeed: {
            decimals: 8,
            priceFeedId: "",
            expo: -5,
            heartbeatDuration: 24 * 60 * 60,
            deploy: true,
            initPrice: "5000000000000",
          },
        },
      },
    },

    arbitrum: {
      pyth: "0xDBaeB34DF0AcfA564a49e13840C5CE2894C4b886",
      signers: ["0x0F711379095f2F0a6fdD1e8Fccd6eBA0833c1F1f"],
      maxOraclePriceAge: 5 * 60,
      maxRefPriceDeviationFactor: decimalToFloat(5, 1), // 50%
      minOracleBlockConfirmations: 255,
      minOracleSigners: 1,

      // price feeds https://docs.chain.link/data-feeds/price-feeds/addresses/?network=arbitrum#Arbitrum%20Mainnet
      tokens: {
        BTC: {
          priceFeed: {
            address: "0x6ce185860a4963106506C203335A2910413708e9",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        "WBTC.e": {
          priceFeed: {
            // use the BTC price feed since the oracle would report the BTC price as well
            address: "0x6ce185860a4963106506C203335A2910413708e9",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        WETH: {
          priceFeed: {
            address: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        DOGE: {
          priceFeed: {
            address: "0x9A7FB1b3950837a8D9b40517626E11D4127C098C",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        SOL: {
          priceFeed: {
            address: "0x24ceA4b8ce57cdA5058b924B9B9987992450590c",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        UNI: {
          priceFeed: {
            address: "0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        LINK: {
          priceFeed: {
            address: "0x86E53CF1B870786351Da77A57575e79CB55812CB",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        ARB: {
          priceFeed: {
            address: "0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        USDC: {
          priceFeed: {
            address: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
        "USDC.e": {
          priceFeed: {
            address: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
        USDT: {
          priceFeed: {
            address: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
        DAI: {
          priceFeed: {
            address: "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
      },
    },
    "core-testnet": {
      //pyth contracts: https://docs.pyth.network/price-feeds/contract-addresses/evm
      pyth: "0x8D254a21b3C86D32F7179855531CE99164721933",
      signers: ["0x0F711379095f2F0a6fdD1e8Fccd6eBA0833c1F1f"],
      maxOraclePriceAge: 5 * 60,
      maxRefPriceDeviationFactor: decimalToFloat(5, 1), // 50%
      minOracleBlockConfirmations: 255,
      minOracleSigners: 1,
      // price feeds IDs: https://pyth.network/developers/price-feed-ids#pyth-evm-beta
      //price infos(including expo): https://pyth.network/price-feeds
      tokens: {
        WCORE: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0x9b4503710cc8c53f75c30e6e4fda1a7064680ef2e0ee97acd2e3a7c37b3c830c",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        WETH: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        WBTC: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        SOL: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        BONK: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419",
            expo: -10,
            decimals: 5,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        USDC: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
        USDT: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
       
      },
    },
    arbFork: {
      //pyth contracts: https://docs.pyth.network/price-feeds/contract-addresses/evm
      pyth: "0xff1a0f4744e8582DF1aE09D5611b887B6a12925C",
      signers: ["0x0F711379095f2F0a6fdD1e8Fccd6eBA0833c1F1f"],
      maxOraclePriceAge: 5 * 60,
      maxRefPriceDeviationFactor: decimalToFloat(5, 1), // 50%
      minOracleBlockConfirmations: 255,
      minOracleSigners: 1,

      // price feeds IDs: https://pyth.network/developers/price-feed-ids#pyth-evm-beta
      //price infos(including expo): https://pyth.network/price-feeds
      tokens: {
        WCORE: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0x9b4503710cc8c53f75c30e6e4fda1a7064680ef2e0ee97acd2e3a7c37b3c830c",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        WETH: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        WBTC: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
       
        USDC: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
        USDT: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
      },
    },
    polygonFork: {
      //pyth contracts: https://docs.pyth.network/price-feeds/contract-addresses/evm
      pyth: "0xff1a0f4744e8582DF1aE09D5611b887B6a12925C",
      signers: ["0x0F711379095f2F0a6fdD1e8Fccd6eBA0833c1F1f"],
      maxOraclePriceAge: 5 * 60,
      maxRefPriceDeviationFactor: decimalToFloat(5, 1), // 50%
      minOracleBlockConfirmations: 255,
      minOracleSigners: 1,

      // price feeds IDs: https://pyth.network/developers/price-feed-ids#pyth-evm-beta
      //price infos(including expo): https://pyth.network/price-feeds
      tokens: {
        WCORE: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0x9b4503710cc8c53f75c30e6e4fda1a7064680ef2e0ee97acd2e3a7c37b3c830c",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        WETH: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        WBTC: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
       
        USDC: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
        USDT: {
          priceFeed: {
            address: "0x0000000000000000000000000000000000000000",
            priceFeedId: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
            expo: -8,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
      },
    },
    avalanche: {
      pyth: "0xaaf548a3A74939650d7A5d7550Cf785975ed400a",
      signers: ["0x7f2CA7713AACD279f7753F804163189E4831c1EE"],
      maxOraclePriceAge: 5 * 60,
      maxRefPriceDeviationFactor: decimalToFloat(5, 1), // 50%
      minOracleBlockConfirmations: 255,
      minOracleSigners: 1,

      // price feeds https://docs.chain.link/data-feeds/price-feeds/addresses/?network=avalanche#Avalanche%20Mainnet
      tokens: {
        "BTC.b": {
          priceFeed: {
            address: "0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        "WETH.e": {
          priceFeed: {
            address: "0x976B3D034E162d8bD72D6b9C989d545b839003b0",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        WAVAX: {
          priceFeed: {
            address: "0x0A77230d17318075983913bC2145DB16C7366156",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
          },
        },
        USDC: {
          priceFeed: {
            address: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
        "USDC.e": {
          priceFeed: {
            address: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
        USDT: {
          priceFeed: {
            address: "0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
        "USDT.e": {
          priceFeed: {
            address: "0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
        "DAI.e": {
          priceFeed: {
            address: "0x51D7180edA2260cc4F6e4EebB82FEF5c3c2B8300",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: (24 + 1) * 60 * 60,
            stablePrice: decimalToFloat(1),
          },
        },
      },
    },

    arbitrumGoerli: {
      pyth: "0x09DFf56A4fF44e0f4436260A04F5CFa65636A481",
      signers: ["0xFb11f15f206bdA02c224EDC744b0E50E46137046", "0x23247a1A80D01b9482E9d734d2EB780a3b5c8E6c"],
      maxOraclePriceAge: 5 * 60,
      maxRefPriceDeviationFactor: decimalToFloat(5, 1), // 50%
      minOracleBlockConfirmations: 255,
      minOracleSigners: 1,

      // price feeds https://docs.chain.link/data-feeds/price-feeds/addresses/?network=arbitrum#Arbitrum%20Goerli
      tokens: {
        USDC: {
          priceFeed: {
            address: "0x1692Bdd32F31b831caAc1b0c9fAF68613682813b",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: 3 * 24 * 60 * 60,
          },
        },
        USDT: {
          priceFeed: {
            address: "0x0a023a3423D9b27A0BE48c768CCF2dD7877fEf5E",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: 3 * 24 * 60 * 60,
          },
        },
        DAI: {
          priceFeed: {
            address: "0x103b53E977DA6E4Fa92f76369c8b7e20E7fb7fe1",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: 3 * 24 * 60 * 60,
          },
        },
      },
    },

    avalancheFuji: {
      pyth: "0x5f64394a2Ab3AcE9eCC071568Fc552489a8de7AF",
      signers: ["0xFb11f15f206bdA02c224EDC744b0E50E46137046", "0x23247a1A80D01b9482E9d734d2EB780a3b5c8E6c"],
      maxOraclePriceAge: 5 * 60,
      maxRefPriceDeviationFactor: decimalToFloat(5, 1), // 50%
      minOracleBlockConfirmations: 255,
      minOracleSigners: 1,

      // price feeds https://docs.chain.link/data-feeds/price-feeds/addresses?network=avalanche#Avalanche%20Testnet
      tokens: {
        // using the same price feed for all stablecoins since Chainlink has only USDT feed on Avalanche Fuji
        USDC: {
          priceFeed: {
            // this is USDT price feed, there is no USDC feed on Avalanche Fuji
            address: "0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: 3 * 24 * 60 * 60,
          },
        },
        USDT: {
          priceFeed: {
            // this is USDT price feed, there is no USDC feed on Avalanche Fuji
            address: "0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: 3 * 24 * 60 * 60,
          },
        },
        DAI: {
          priceFeed: {
            // this is USDT price feed, there is no USDC feed on Avalanche Fuji
            address: "0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad",
            priceFeedId: "",
            expo: -5,
            decimals: 8,
            heartbeatDuration: 3 * 24 * 60 * 60,
          },
        },
      },
    },
  };

  const oracleConfig: OracleConfig = config[hre.network.name];
  if (!oracleConfig.tokens) {
    oracleConfig.tokens = {};
  }

  const tokens = await hre.gmx.getTokens();

  // to make sure all tokens have an oracle type so oracle deployment/configuration script works correctly
  for (const tokenSymbol of Object.keys(tokens)) {
    if (oracleConfig.tokens[tokenSymbol] === undefined) {
      oracleConfig.tokens[tokenSymbol] = {};
    }
  }

  // validate there are corresponding tokens for price feeds
  for (const tokenSymbol of Object.keys(oracleConfig.tokens)) {
    if (!tokens[tokenSymbol]) {
      throw new Error(`Missing token for ${tokenSymbol}`);
    }

    if (oracleConfig.tokens[tokenSymbol].oracleType === undefined) {
      oracleConfig.tokens[tokenSymbol].oracleType = TOKEN_ORACLE_TYPES.DEFAULT;
    }
  }

  return oracleConfig;
}
