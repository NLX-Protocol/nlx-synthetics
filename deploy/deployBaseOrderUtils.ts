import { createDeployFunction } from "../utils/deploy";

const func = createDeployFunction({
  contractName: "BaseOrderUtils",
  // contractLocation: "contracts/order/BaseOrderUtils.sol:BaseOrderUtils",
});

export default func;
