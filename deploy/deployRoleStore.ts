import { createDeployFunction } from "../utils/deploy";

const func = createDeployFunction({
  contractName: "RoleStore",
  // id: "RoleStore_3",
  contractLocation: "contracts/role/RoleStore.sol:RoleStore",
});

func.dependencies = func.dependencies.concat(["FundAccounts"]);

export default func;
