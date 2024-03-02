import fetch from "node-fetch";
import hre from "hardhat";
import { expandDecimals, bigNumberify } from "./math";

export async function fetchTickerPrices() {
  const tickersUrl = getTickersUrl();
  const tokenPricesResponse = await fetch(tickersUrl);
  const tokenPrices = await tokenPricesResponse.json();
  const pricesByTokenAddress = {};

  for (const tokenPrice of tokenPrices) {
    pricesByTokenAddress[tokenPrice.tokenAddress.toLowerCase()] = {
      min: bigNumberify(tokenPrice.minPrice).mul(expandDecimals(1, tokenPrice.oracleDecimals)),
      max: bigNumberify(tokenPrice.maxPrice).mul(expandDecimals(1, tokenPrice.oracleDecimals)),
    };
  }


  return pricesByTokenAddress;
}

export function getTickersUrl() {
  if (hre.network.name === "arbitrum") {
    return "https://arbitrum.gmx-oracle.io/prices/tickers";
  }

  if (hre.network.name === "avalanche") {
    return "https://avalanche.gmx-oracle.io/prices/tickers";
  }

  throw new Error("Unsupported network");
}

export const priceFeedPrices = {};

priceFeedPrices.wnt = {
  contractName: "wnt",
  precision: 8,
  min: 5000,
  max: 5000,
};

priceFeedPrices.wnt.withSpread = {
  contractName: "wnt",
  precision: 8,
  min: 4990,
  max: 5010,
};

priceFeedPrices.wnt.increased = {
  contractName: "wnt",
  precision: 8,
  min: 5020,
  max: 5020,
};

priceFeedPrices.wnt.increased.byFiftyPercent = {
  contractName: "wnt",
  precision: 8,
  min: 7500,
  max: 7500,
};

priceFeedPrices.wnt.increased.withSpread = {
  contractName: "wnt",
  precision: 8,
  min: 5010,
  max: 5030,
};

priceFeedPrices.wnt.decreased = {
  contractName: "wnt",
  precision: 8,
  min: 4980,
  max: 4980,
};

priceFeedPrices.wnt.decreased.withSpread = {
  contractName: "wnt",
  precision: 8,
  min: 4970,
  max: 4990,
};

priceFeedPrices.usdc = {
  contractName: "usdc",
  precision: 18,
  min: 1,
  max: 1,
};

priceFeedPrices.usdt = {
  contractName: "usdt",
  precision: 18,
  min: 1,
  max: 1,
};

priceFeedPrices.wbtc = {
  contractName: "wbtc",
  precision: 20,
  min: 50000,
  max: 50000,
};

priceFeedPrices.sol = {
  contractName: "sol",
  precision: 16,
  min: 50,
  max: 50,
};

priceFeedPrices.ethUsdMarket = {
  indexTokenPrice: {
    min: 5000,
    max: 5000,
  },
  longTokenPrice: {
    min: 5000,
    max: 5000,
  },
  shortTokenPrice: {
    min: 1,
    max: 1,
  },
};

priceFeedPrices.ethUsdSingleTokenMarket = {
  indexTokenPrice: {
    min: 5000,
    max: 5000,
  },
  longTokenPrice: {
    min: 1,
    max: 1,
  },
  shortTokenPrice: {
    min: 1,
    max: 1,
  },
};

priceFeedPrices.ethUsdSingleTokenMarket.increased = {};

priceFeedPrices.ethUsdSingleTokenMarket.increased.byFiftyPercent = {
  indexTokenPrice: {
    min: 7500,
    max: 7500,
  },
  longTokenPrice: {
    min: 1,
    max: 1,
  },
  shortTokenPrice: {
    min: 1,
    max: 1,
  },
};

priceFeedPrices.ethUsdMarket.withSpread = {
  indexTokenPrice: {
    min: 4990,
    max: 5010,
  },
  longTokenPrice: {
    min: 4990,
    max: 5010,
  },
  shortTokenPrice: {
    min: 1,
    max: 1,
  },
};

priceFeedPrices.ethUsdMarket.increased = {
  indexTokenPrice: {
    min: 5020,
    max: 5020,
  },
  longTokenPrice: {
    min: 5020,
    max: 5020,
  },
  shortTokenPrice: {
    min: 1,
    max: 1,
  },
};

priceFeedPrices.ethUsdMarket.decreased = {
  indexTokenPrice: {
    min: 4980,
    max: 4980,
  },
  longTokenPrice: {
    min: 4980,
    max: 4980,
  },
  shortTokenPrice: {
    min: 1,
    max: 1,
  },
};


export const prices = {};

prices.wnt = {
  contractName: "wnt",
  precision: 8,
  min: expandDecimals(5000, 4),
  max: expandDecimals(5000, 4),
};

prices.wnt.withSpread = {
  contractName: "wnt",
  precision: 8,
  min: expandDecimals(4990, 4),
  max: expandDecimals(5010, 4),
};

prices.wnt.increased = {
  contractName: "wnt",
  precision: 8,
  min: expandDecimals(5020, 4),
  max: expandDecimals(5020, 4),
};

prices.wnt.increased.byFiftyPercent = {
  contractName: "wnt",
  precision: 8,
  min: expandDecimals(7500, 4),
  max: expandDecimals(7500, 4),
};

prices.wnt.increased.withSpread = {
  contractName: "wnt",
  precision: 8,
  min: expandDecimals(5010, 4),
  max: expandDecimals(5030, 4),
};

prices.wnt.decreased = {
  contractName: "wnt",
  precision: 8,
  min: expandDecimals(4980, 4),
  max: expandDecimals(4980, 4),
};

prices.wnt.decreased.withSpread = {
  contractName: "wnt",
  precision: 8,
  min: expandDecimals(4970, 4),
  max: expandDecimals(4990, 4),
};

prices.usdc = {
  contractName: "usdc",
  precision: 18,
  min: expandDecimals(1, 6),
  max: expandDecimals(1, 6),
};

prices.usdt = {
  contractName: "usdt",
  precision: 18,
  min: expandDecimals(1, 6),
  max: expandDecimals(1, 6),
};

prices.wbtc = {
  contractName: "wbtc",
  precision: 20,
  min: expandDecimals(50000, 2),
  max: expandDecimals(50000, 2),
};

prices.sol = {
  contractName: "sol",
  precision: 16,
  min: expandDecimals(50, 5),
  max: expandDecimals(50, 5),
};

prices.ethUsdMarket = {
  indexTokenPrice: {
    min: expandDecimals(5000, 12),
    max: expandDecimals(5000, 12),
  },
  longTokenPrice: {
    min: expandDecimals(5000, 12),
    max: expandDecimals(5000, 12),
  },
  shortTokenPrice: {
    min: expandDecimals(1, 24),
    max: expandDecimals(1, 24),
  },
};

prices.ethUsdSingleTokenMarket = {
  indexTokenPrice: {
    min: expandDecimals(5000, 12),
    max: expandDecimals(5000, 12),
  },
  longTokenPrice: {
    min: expandDecimals(1, 24),
    max: expandDecimals(1, 24),
  },
  shortTokenPrice: {
    min: expandDecimals(1, 24),
    max: expandDecimals(1, 24),
  },
};

prices.ethUsdSingleTokenMarket.increased = {};

prices.ethUsdSingleTokenMarket.increased.byFiftyPercent = {
  indexTokenPrice: {
    min: expandDecimals(7500, 12),
    max: expandDecimals(7500, 12),
  },
  longTokenPrice: {
    min: expandDecimals(1, 24),
    max: expandDecimals(1, 24),
  },
  shortTokenPrice: {
    min: expandDecimals(1, 24),
    max: expandDecimals(1, 24),
  },
};

prices.ethUsdMarket.withSpread = {
  indexTokenPrice: {
    min: expandDecimals(4990, 12),
    max: expandDecimals(5010, 12),
  },
  longTokenPrice: {
    min: expandDecimals(4990, 12),
    max: expandDecimals(5010, 12),
  },
  shortTokenPrice: {
    min: expandDecimals(1, 24),
    max: expandDecimals(1, 24),
  },
};

prices.ethUsdMarket.increased = {
  indexTokenPrice: {
    min: expandDecimals(5020, 12),
    max: expandDecimals(5020, 12),
  },
  longTokenPrice: {
    min: expandDecimals(5020, 12),
    max: expandDecimals(5020, 12),
  },
  shortTokenPrice: {
    min: expandDecimals(1, 24),
    max: expandDecimals(1, 24),
  },
};

prices.ethUsdMarket.decreased = {
  indexTokenPrice: {
    min: expandDecimals(4980, 12),
    max: expandDecimals(4980, 12),
  },
  longTokenPrice: {
    min: expandDecimals(4980, 12),
    max: expandDecimals(4980, 12),
  },
  shortTokenPrice: {
    min: expandDecimals(1, 24),
    max: expandDecimals(1, 24),
  },
};
