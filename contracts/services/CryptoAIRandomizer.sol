// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../interfaces/ICryptoAIData.sol";

contract CryptoAIRandomizer is Initializable, OwnableUpgradeable {
    // CryptoAI contract address
    address public cryptoAIAddress;

    // Random nonce for generating traits
    uint256 private nonce;

    event TraitsGenerated(uint256 indexed seed, uint256[5] traits);

    function initialize(address _cryptoAIAddress) public initializer {
        require(_cryptoAIAddress != address(0), "Invalid CryptoAI address");
        cryptoAIAddress = _cryptoAIAddress;
        nonce = 0;
        __Ownable_init();
    }

    function setCryptoAIAddress(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "Invalid address");
        cryptoAIAddress = _newAddress;
    }

    function generateTraits(uint256 seed) public returns (uint256[5] memory traits, string memory svgImage) {
        // Increment nonce for additional randomness
        nonce++;

        // Generate random traits using the seed and nonce
        for(uint i = 0; i < 5; i++) {
            // Using different aspects of the seed for each trait
            uint256 randomValue = uint256(keccak256(abi.encodePacked(seed, nonce, i, block.timestamp)));
            traits[i] = randomValue % 100; // Assuming each trait has max 100 variations
        }

        // Get SVG image from CryptoAI contract
        ICryptoAIData cryptoAI = ICryptoAIData(cryptoAIAddress);

        // Create a temporary token ID for visualization (not actually minting)
        uint256 tempTokenId = uint256(keccak256(abi.encodePacked(seed, block.timestamp)));

        // Unlock render with DNA 0 (assuming default DNA) and generated traits
        cryptoAI.unlockRenderAgent(tempTokenId, 0, traits);

        // Get SVG image
        svgImage = cryptoAI.cryptoAIImageSvg(tempTokenId);

        emit TraitsGenerated(seed, traits);
    }

    function getRandomNumber(uint256 seed, uint256 index) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(seed, block.timestamp, msg.sender, nonce, index)));
    }
}
