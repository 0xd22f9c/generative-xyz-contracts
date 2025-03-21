import { updateConfig } from '.';
import { CryptoAIData } from "./cryptoAIData";
const { ethers } = require("hardhat");

async function main() {
    // if (process.env.NETWORK != "local") {
    //     console.log("wrong network");
    //     return;
    // }

    try {
        // Get signer
        // const [deployer] = await ethers.getSigners();
        const deployerAddress = process.env.PUBLIC_KEY || "0x0000000000000000000000000000000000000000";
        console.log("\nDeployment Info:");
        console.log("Network:", process.env.NETWORK);
        console.log("Deployer address:", deployerAddress);

        // Deploy CryptoAIData contract
        const dataContract = new CryptoAIData(process.env.NETWORK, deployerAddress, deployerAddress);

        // Deploy with deployer address
        const address = await dataContract.deployUpgradeable(deployerAddress);
        console.log('\nDeployment Result:');
        console.log('CryptoAIData contract address:', address);

        // Update config with new address
        await updateConfig("dataContractAddress", address);
        await updateConfig("cryptoAIAddress", address); // Update cryptoAIAddress to point to data contract

        // Verify the owner
        const contract = await ethers.getContractAt("CryptoAIData", address);
        const owner = await contract.owner();
        console.log('\nOwnership Verification:');
        console.log('Contract owner:', owner);
        console.log('Deployer address:', deployerAddress);

        if (owner.toLowerCase() !== deployerAddress.toLowerCase()) {
            console.warn('⚠️ Warning: Owner mismatch!');
        } else {
            console.log('✅ Owner verified successfully');
        }

        console.log('\nDeployment completed successfully');
    } catch (error) {
        console.error('\nDeploy failed:', error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
