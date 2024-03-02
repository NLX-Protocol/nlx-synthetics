import { createDeployFunction } from "../utils/deploy";

const func = createDeployFunction({
  contractName: "GasUtils",
  // contractLocation: "contracts/gas/GasUtils.sol:GasUtils"
});

export default func;
