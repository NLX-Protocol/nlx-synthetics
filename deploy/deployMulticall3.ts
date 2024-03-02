import { createDeployFunction } from "../utils/deploy";

const func = createDeployFunction({
  contractName: "Multicall3",
  id: "Multicall3",
  contractLocation: "contracts/mock/Multicall3.sol",
});
// override tags
func.tags = ["Multicall"];

export default func;
