import hre from "hardhat";

const { ethers } = hre;
import * as keys from "../utils/keys";

async function main() {
    const [_, feeCollector] = await ethers.getSigners();

    const tokens = await hre.gmx.getTokens();
    const addressToSymbol: { [address: string]: string } = {};
    for (const [tokenSymbol, tokenConfig] of Object.entries(tokens)) {
        let address = tokenConfig.address;
        if (!address) {
            address = (await hre.ethers.getContract(tokenSymbol)).address;
        }
        addressToSymbol[address] = tokenSymbol;
    }

    const reader = await hre.ethers.getContract("Reader");
    const dataStore = await hre.ethers.getContract("DataStore");
    const feeHandler = await hre.ethers.getContract("FeeHandler");
    console.log("reading data from DataStore %s Reader %s", dataStore.address, reader.address);
    const markets = [...(await reader.getMarkets(dataStore.address, 0, 100))];
    markets.sort((a, b) => a.indexToken.localeCompare(b.indexToken));
    const marketAddresses = [];
    const tokenAddresses = []

    for (const market of markets) {
        const isDisabled = await dataStore.getBool(keys.isMarketDisabledKey(market.marketToken));
        if (!isDisabled) {
            marketAddresses.push(market.marketToken);
            tokenAddresses.push(market.longToken);
        }
    }

    const tx = await feeHandler.claimFees(marketAddresses, tokenAddresses, {
        gasLimit: 2500000
    });
    // console.log(tx);

    console.log("hash: ", tx.hash);

    await tx.wait()
    console.log("done");

}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((ex) => {
        console.error(ex);
        process.exit(1);
    });
