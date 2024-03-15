
import { executeWithOracleParams } from "./exchange";
import { parseLogs } from "./event";
import { ethers } from "hardhat";

export async function executeLiquidation(fixture, overrides) {
  const { wnt, usdc } = fixture.contracts;
  const { account, market, collateralToken, isLong, gasUsageLabel } = overrides;
  const { liquidationHandler } = fixture.contracts;
  const tokens = overrides.tokens || [wnt.address, usdc.address];
  const realtimeFeedTokens = overrides.realtimeFeedTokens || [];
  const priceFeedTokens = overrides.priceFeedTokens || [];
  const prices = overrides.prices || [5000, 1];


  const params = {
    tokens,
    prices,
    realtimeFeedTokens,
    priceFeedTokens,
    execute: async (key, oracleParams) => {
      return await liquidationHandler.executeLiquidation(
        account,
        market.marketToken,
        collateralToken.address,
        isLong,
        oracleParams,
        { value: ethers.BigNumber.from(2) }
      );
    },


    gasUsageLabel,
  };

  const txReceipt = await executeWithOracleParams(fixture, params);
  const logs = parseLogs(fixture, txReceipt);

  const result = { txReceipt, logs };

  if (overrides.afterExecution) {
    await overrides.afterExecution(result);
  }

  return result;
}
