import { bigNumberify, expandDecimals } from "./math";
import { executeWithOracleParams } from "./exchange";
import { TOKEN_ORACLE_TYPES } from "./oracle";
import * as keys from "./keys";

export async function getIsAdlEnabled(dataStore, market, isLong) {
  return await dataStore.getBool(keys.isAdlEnabledKey(market, isLong));
}

export async function getLatestAdlBlock(dataStore, market, isLong) {
  return await dataStore.getUint(keys.latestAdlBlockKey(market, isLong));
}

export async function updateAdlState(fixture, overrides = {}) {
  const { adlHandler } = fixture.contracts;
  const { market, isLong, gasUsageLabel } = overrides;
  const { wnt, usdc } = fixture.contracts;
  const tokenOracleTypes = overrides.tokenOracleTypes || [TOKEN_ORACLE_TYPES.DEFAULT, TOKEN_ORACLE_TYPES.DEFAULT];
  const tokens = overrides.tokens || [wnt.address, usdc.address];
  const realtimeFeedTokens = overrides.realtimeFeedTokens || [];
  const priceFeedTokens = overrides.priceFeedTokens || [];
  const prices = overrides.prices || [5000, 1];

  const block = await ethers.provider.getBlock();

  const params = {
    oracleBlockNumber: bigNumberify(block.number),
    tokens,
    tokenOracleTypes,
    prices,
    realtimeFeedTokens,
    priceFeedTokens,
    execute: async (key, oracleParams) => {
      return await adlHandler.updateAdlState(market.marketToken, isLong, oracleParams,
        { value: ethers.BigNumber.from(4) }
      );
    },
    gasUsageLabel,
  };

  await executeWithOracleParams(fixture, params);
}

export async function executeAdl(fixture, overrides = {}) {
  const { adlHandler } = fixture.contracts;
  const { account, market, collateralToken, isLong, sizeDeltaUsd, gasUsageLabel } = overrides;
  const { wnt, usdc } = fixture.contracts;
  const tokens = overrides.tokens || [wnt.address, usdc.address];
  const realtimeFeedTokens = overrides.realtimeFeedTokens || [];
  const priceFeedTokens = overrides.priceFeedTokens || [];
  const prices = overrides.prices || [5000, 1];

  const block = overrides.block || (await ethers.provider.getBlock());

  const params = {
    oracleBlockNumber: bigNumberify(block.number),
    tokens,
    prices,
    realtimeFeedTokens,
    priceFeedTokens,
    execute: async (key, oracleParams) => {
      return await adlHandler.executeAdl(
        account,
        market.marketToken,
        collateralToken.address,
        isLong,
        sizeDeltaUsd,
        oracleParams,
        { value: ethers.BigNumber.from(2) }
      );
    },
    gasUsageLabel,
  };

  await executeWithOracleParams(fixture, params);
}
