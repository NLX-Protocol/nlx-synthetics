import { mine, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TokenConfig } from "../config/tokens";

import * as keys from "../utils/keys";
import { setAddressIfDifferent, setUintIfDifferent } from "../utils/dataStore";
import { expandDecimals } from "../utils/math";


const func = async ({ getNamedAccounts, deployments, gmx, network, run }: HardhatRuntimeEnvironment) => {
  const { deploy, log, } = deployments;
  const { deployer } = await getNamedAccounts();
  const { getTokens } = gmx;
  const tokens: Record<string, TokenConfig> = await getTokens();

  for (const [tokenSymbol, token] of Object.entries(tokens)) {
    if (token.synthetic || !token.deploy) {
      continue;
    }

    if (network.live) {
      console.warn("WARN: Deploying token on live network");
    }

    let contract = ""
    let contractLocation = ""

    if (network.name === "localhost" && token.wrappedNative) {
      contract = "WCORE"
      contractLocation = "contracts/mock/WCORE.sol:WCORE"
    } else if (network.name === "core-mainnet" && token.wrappedNative) {
      contract = "WXCORE"
      contractLocation = "contracts/mock/WXCORE.sol:WXCORE";
    } else if ((network.name === "core-testnet" || network.name === "hardhat") && token.wrappedNative)  {
      contract = "WNT"
      contractLocation = "contracts/mock/WNT.sol:WNT"
    }else{
      contract = "MintableToken"
      contractLocation = "contracts/mock/MintableToken.sol:MintableToken"
    }

    const existingToken = await deployments.getOrNull(tokenSymbol);
    if (existingToken && network.live) {
      log(`Reusing ${tokenSymbol} at ${existingToken.address}`);
      console.warn(`WARN: bytecode diff is not checked`);
      tokens[tokenSymbol].address = existingToken.address;
      try {

        console.log(`verifying ${tokenSymbol}...`);
        await run("verify:verify", {
          contract: contractLocation,
          address: existingToken.address,
          constructorArguments: token.wrappedNative ? [] : [tokenSymbol, tokenSymbol, token.decimals]
        });
        console.log(`${tokenSymbol} verified`);

      } catch (error) {
        console.log("verification failed", error);
      }
      continue;
    }

  

    const { address, newlyDeployed } = await deploy(tokenSymbol, {
      from: deployer,
      log: true,
      contract,
      args: token.wrappedNative ? [] : [tokenSymbol, tokenSymbol, token.decimals],
    });

    tokens[tokenSymbol].address = address;
    if (newlyDeployed) {
      if (token.wrappedNative && !network.live) {
        await setBalance(address, expandDecimals(1000, token.decimals));
      }



      if (!token.wrappedNative) {
        const tokenContract = await ethers.getContractAt("MintableToken", address);
        await tokenContract.mint(deployer, expandDecimals(1000000000, token.decimals));
      }
    }
  }

  for (const [tokenSymbol, token] of Object.entries(tokens)) {
    if (token.synthetic) {
      continue;
    }

    await setUintIfDifferent(
      keys.tokenTransferGasLimit(token.address!),
      token.transferGasLimit,
      `${tokenSymbol} transfer gas limit`
    );
  }

  const wrappedAddress = Object.values(tokens).find((token) => token.wrappedNative)?.address;
  if (!wrappedAddress) {
    throw new Error("No wrapped native token found");
  }
  await setAddressIfDifferent(keys.WNT, wrappedAddress, "WNT");
};

func.tags = ["Tokens"];
func.dependencies = ["DataStore"];
export default func;
