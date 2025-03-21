import * as path from "path";
const { ethers, upgrades } = require("hardhat");
const hardhatConfig = require("../../../hardhat.config");

class CryptoAIRandomizer {
    network: string;
    signer: any;

    constructor(network: string) {
        this.network = network;
    }

    async init() {
        // Get signer from hardhat
        [this.signer] = await ethers.getSigners();
    }

    async deployUpgradeable(cryptoAIAddress: string) {
        await this.init();

        const contract = await ethers.getContractFactory(
            "CryptoAIRandomizer",
            this.signer
        );
        console.log("CryptoAIRandomizer.deploying ...");
        const proxy = await upgrades.deployProxy(contract, [cryptoAIAddress], {
            initializer: 'initialize(address)',
        });
        await proxy.deployed();
        console.log("CryptoAIRandomizer deployed at proxy:", proxy.address);
        return proxy.address;
    }

    async getContract(contractAddress: string) {
        await this.init();
        return await ethers.getContractAt("CryptoAIRandomizer", contractAddress, this.signer);
    }

    async generateTraits(contractAddress: string, gas: number, seed: number) {
        const contract = await this.getContract(contractAddress);

        try {
            const tx = await contract.generateTraits(seed, {
                gasLimit: gas
            });

            const receipt = await tx.wait();
            console.log("Transaction hash:", receipt.transactionHash);

            const event = receipt.events?.find((e: {event: string}) => e.event === 'TraitsGenerated');
            if (event) {
                console.log("Generated traits:", event.args?.traits.toString());
                console.log("SVG Image:", event.args?.svgImage);
            }

            return receipt;
        } catch (error) {
            console.error("Error generating traits:", error);
            throw error;
        }
    }

    async setCryptoAIAddress(contractAddress: string, gas: number, newAddress: string) {
        const contract = await this.getContract(contractAddress);

        try {
            const tx = await contract.setCryptoAIAddress(newAddress, {
                gasLimit: gas
            });
            const receipt = await tx.wait();
            console.log("Transaction hash:", receipt.transactionHash);
            return receipt;
        } catch (error) {
            console.error("Error setting CryptoAI address:", error);
            throw error;
        }
    }
}

export {CryptoAIRandomizer};
