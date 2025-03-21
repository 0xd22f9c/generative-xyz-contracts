import {CryptoAIRandomizer} from "./randomizer";
import {initConfig} from "./config";

async function main() {
    // if (process.env.NETWORK != "base_mainnet") {
    //     console.log("wrong network");
    //     return;
    // }

    // Get config
    const config = await initConfig();
    if (!config.randomizerAddress) {
        console.error("Randomizer address not found in config");
        return;
    }

    // Initialize contract
    const randomizerContract = new CryptoAIRandomizer(
        process.env.NETWORK || "local",
    );

    // Upgrade contract
    await randomizerContract.upgradeContract(config.randomizerAddress);
    console.log('Upgrade successful');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
