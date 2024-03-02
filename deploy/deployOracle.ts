import { grantRoleIfNotGranted } from "../utils/role";
import { createDeployFunction } from "../utils/deploy";
import * as keys from "../utils/keys";
import { setUintIfDifferent } from "../utils/dataStore";

const constructorContracts = ["RoleStore", "OracleStore"];

const func = createDeployFunction({
  contractName: "Oracle",
  dependencyNames: constructorContracts,
  getDeployArgs: async ({ dependencyContracts, network, gmx, get }) => {
    const oracleConfig = await gmx.getOracle();

    let mockPythContractAddress = oracleConfig.pyth;
    
    if (network.name === "hardhat") {
      const mockPythContract = await get("MockPythContract");
      mockPythContractAddress = mockPythContract.address;
    }
    return constructorContracts
      .map((dependencyName) => dependencyContracts[dependencyName].address)
      .concat(mockPythContractAddress);
  },
  afterDeploy: async ({ deployedContract,  }) => {
    const oracleConfig = await gmx.getOracle();
    await setUintIfDifferent(
      keys.MIN_ORACLE_BLOCK_CONFIRMATIONS,
      oracleConfig.minOracleBlockConfirmations,
      "min oracle block confirmations"
    );
    await setUintIfDifferent(keys.MAX_ORACLE_PRICE_AGE, oracleConfig.maxOraclePriceAge, "max oracle price age");
    await setUintIfDifferent(
      keys.MAX_ORACLE_REF_PRICE_DEVIATION_FACTOR,
      oracleConfig.maxRefPriceDeviationFactor,
      "max ref price deviation factor"
    );

    await setUintIfDifferent(
      keys.MAX_ORACLE_REF_PRICE_DEVIATION_FACTOR,
      oracleConfig.maxRefPriceDeviationFactor,
      "max ref price deviation factor"
    );
    // the Oracle contract requires the CONTROLLER to emit events
    await grantRoleIfNotGranted(deployedContract.address, "CONTROLLER", "oracle");
  },
  id: "Oracle_3",
});

func.dependencies = func.dependencies.concat(["Tokens", "MockPythContract"]);

export default func;
