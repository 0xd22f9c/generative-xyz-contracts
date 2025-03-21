import {CryptoAIRandomizer} from "./randomizer";
import {initConfig} from "./config";
const { ethers } = require("hardhat");

async function main() {
    if (process.env.NETWORK != "local") {
        console.log("wrong network");
        return;
    }

    // Get config
    const config = await initConfig();
    if (!config.randomizerAddress || !config.cryptoAIAddress || !config.contractAddress) {
        console.error("Required addresses not found in config");
        return;
    }

    try {
        // Get signer
        const [deployer] = await ethers.getSigners();
        const deployerAddress = process.env.PUBLIC_KEY || "0x0000000000000000000000000000000000000000";
        console.log("\nTest Configuration:");
        console.log("Network:", process.env.NETWORK);
        console.log("Tester address:", deployerAddress);
        console.log("Randomizer address:", config.randomizerAddress);
        console.log("CryptoAI address:", config.cryptoAIAddress);
        console.log("CryptoAI NFT address:", config.contractAddress);

        // Get contract instances
        const randomizerContract = await ethers.getContractAt("CryptoAIRandomizer", config.randomizerAddress);
        const cryptoAIDataContract = await ethers.getContractAt("CryptoAIData", config.cryptoAIAddress);
        const cryptoAIContract = await ethers.getContractAt("CryptoAI", config.contractAddress);

        // Verify and set contract permissions
        console.log("\nVerifying contract permissions...");

        // Check if deployer is owner of CryptoAIData
        const dataOwner = await cryptoAIDataContract.owner();
        console.log("CryptoAIData owner:", dataOwner);
        console.log("Deployer address:", deployerAddress);

        // Always try to unseal the contract first
        console.log("Attempting to unseal contract...");
        try {
            await cryptoAIDataContract.unSealContract();
            console.log("✅ Contract unsealed successfully");
        } catch (error) {
            console.log("Contract may already be unsealed, proceeding...");
        }

        // Set CryptoAI agent address if needed
        const currentAgentAddr = await cryptoAIDataContract._cryptoAIAgentAddr();
        if (currentAgentAddr.toLowerCase() !== randomizerContract.address.toLowerCase()) {
            console.log("Setting Randomizer as CryptoAI agent...");
            const tx = await cryptoAIDataContract.changeCryptoAIAgentAddress(randomizerContract.address, {
                gasLimit: 300000
            });
            await tx.wait();
            console.log("✅ Agent address updated");
        }

        // Initialize contract data
        // console.log("\nInitializing contract data...");
        // try {
        //     // Add test DNA types
        //     const dnaNames = ["Human", "Robot", "Animal"];
        //     const dnaRarities = [100, 100, 100];
        //     await cryptoAIDataContract.addDNA(dnaNames, dnaRarities);
        //     console.log("✅ DNA types added");

        //     // Add test items
        //     const key = "test_key";
        //     const names = ["Test Item 1", "Test Item 2", "Test Item 3"];
        //     const traits = [10, 20, 30];
        //     const positions = [[1, 2], [3, 4], [5, 6]];
        //     await cryptoAIDataContract.addItem(key, names, traits, positions);
        //     console.log("✅ Test items added");

        //     // Try to seal the contract
        //     await cryptoAIDataContract.sealContract();
        //     console.log("Contract sealed successfully");
        // } catch (error) {
        //     console.log("Contract initialization failed:", error);
        // }

        // // Test CryptoAI address
        // const cryptoAIAddress = await randomizerContract.cryptoAIAddress();
        // console.log("CryptoAI address:", cryptoAIAddress);

        // if (cryptoAIAddress.toLowerCase() !== config.cryptoAIAddress.toLowerCase()) {
        //     console.log("❌ CryptoAI address mismatch!");
        //     console.log("Setting correct CryptoAI address...");
        //     const tx = await randomizerContract.setCryptoAIAddress(config.cryptoAIAddress, {
        //         gasLimit: 300000
        //     });
        //     await tx.wait();
        //     console.log("✅ CryptoAI address updated successfully");
        // } else {
        //     console.log("✅ CryptoAI address is correct");
        // }

        // Test 2: Generate traits
        console.log("\nTest 2: Generate traits");

        // Unseal contract first
        console.log("Unsealing contract...");
        await cryptoAIDataContract.unSealContract();
        console.log("✅ Contract unsealed");

        // Set CryptoAI agent address to the Randomizer contract
        console.log("Setting Randomizer as CryptoAI agent...");
        await cryptoAIDataContract.changeCryptoAIAgentAddress(randomizerContract.address);
        console.log("✅ Agent address updated");

        // Verify agent address
        const verifiedAgentAddr = await cryptoAIDataContract._cryptoAIAgentAddr();
        console.log("Current agent address:", verifiedAgentAddr);
        console.log("Randomizer address:", randomizerContract.address);
        if (verifiedAgentAddr.toLowerCase() !== randomizerContract.address.toLowerCase()) {
            throw new Error("Agent address mismatch!");
        }
        console.log("✅ Agent address verified");

        // Seal contract again
        console.log("Sealing contract...");
        await cryptoAIDataContract.sealContract();
        console.log("✅ Contract sealed");

        // Set up CryptoAI contract
        console.log("\nSetting up CryptoAI contract...");
        // Set deployer as admin
        await cryptoAIContract.allowAdmin(deployer.address, true);
        console.log("✅ Admin permissions granted");
        // Set CryptoAIData address
        await cryptoAIContract.changeCryptoAiDataAddress(cryptoAIDataContract.address);
        console.log("✅ CryptoAIData address set");

        // Mint token first with test data
        const testDNA = 0; // Default DNA
        const testTraits = [0, 0, 0, 0, 0]; // Default traits
        console.log("\nMinting token...");
        const mintTx = await cryptoAIContract.mint(
            deployer.address,
            randomizerContract.address, // Using randomizer as agent address
            testDNA,
            testTraits,
            {
                gasLimit: 3000000
            }
        );
        const mintReceipt = await mintTx.wait();

        // Get the token ID from the receipt logs
        const tokenId = 1; // First token ID since we just deployed
        console.log("✅ Token minted successfully with ID:", tokenId);

        // Generate traits using the minted token ID as seed
        console.log("\nGenerating traits...");
        const tx = await randomizerContract.generateTraits(tokenId, {
            gasLimit: 3000000
        });
        const receipt = await tx.wait();
        console.log("Transaction hash:", receipt.transactionHash);

        const event = receipt.events?.find((e: {event: string}) => e.event === 'TraitsGenerated');
        if (event) {
            console.log("Generated traits:", event.args?.traits.toString());
            console.log("SVG Image:", event.args?.svgImage);
        }
        console.log("✅ Traits generated successfully");

        console.log("\nAll tests completed successfully!");
    } catch (error) {
        console.error("\nTest execution failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
