import { logGasUsage } from "./gas";
import * as keys from "../utils/keys";

export function getPriceFeedId(dataStore, key) {
  return dataStore.getBytes32(key);
}
export function getExecuteParams(fixture, { tokens, prices }) {

  const params = {};

  if (tokens) {
    params.tokens = []
    for (let i = 0; i < tokens.length; i++) {
      params.tokens.push(tokens[i].address);
    }
  }
  if (prices) {
    params.prices = prices.map((price) => price.max ? price.max : price)
  }

  return params;
}

export async function executeWithOracleParams(fixture, overrides) {
  const {
    key,
    tokens,
    prices,
    execute,
    gasUsageLabel,
    simulate
  } = overrides;
  const { mockPythContract, dataStore, } = fixture.contracts

  const priceFeedIds = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const priceFeedIdKey = keys.priceFeedIdKey(token);
    const priceFeedId = await getPriceFeedId(dataStore, priceFeedIdKey,);
    priceFeedIds.push(priceFeedId)
  }


  const pythUpdateData = await mockPythContract.getPriceUpdateData(priceFeedIds, prices)

  const updateFee = await mockPythContract.getUpdateFee(pythUpdateData);



  const args = {
    tokens,
    pythUpdateData
  };

  let oracleParams;
  //need only tokens and priceData
  if (simulate) {
    oracleParams = args;
  } else {
    //pythUpdateData   
    oracleParams = args;
  }





  return await logGasUsage({
    tx: execute(key, oracleParams, { value: updateFee }),
    label: gasUsageLabel,
  });
}
