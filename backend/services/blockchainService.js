// Essential library for interacting with the Ethereum blockchain
const { ethers } = require('ethers');

// Connection URL for the blockchain node (local Hardhat by default)
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
// Private key of the administrator account allowed to mint NFTs
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
// Deployment address of the University NFT smart contract
const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

// Alert if essential configuration is missing
if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.warn("⚠️ Blockchain configuration missing. Minting will fail.");
}

// Minimal ABI (Application Binary Interface) needed to interact with the contract
const ABI = [
    // We call this function to mint new tokens
    "function safeMint(address to, string memory _tokenURI) public",
    // We listen for this event to find the new Token ID
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

/**
 * Service: mintNFT
 * Executes a transaction on the blockchain to mint a new academic certificate.
 */
async function mintNFT(toAddress, tokenURI) {
    try {
        // 1. Setup Provider (Connection to the node)
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        // 2. Setup Signer (The account signing/paying for the transaction)
        const signer = new ethers.Wallet(PRIVATE_KEY, provider);
        // 3. Setup Contract instance (Javascript object linked to the on-chain contract)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        console.log(`Minting NFT to ${toAddress}...`);
        
        // 4. Send the transaction to the network
        const tx = await contract.safeMint(toAddress, tokenURI);
        // 5. Wait for the transaction to be mined and confirmed
        const receipt = await tx.wait();

        // 6. Post-transaction analysis: Extract the Token ID from the event logs
        // We look through all events fired during this transaction for the 'Transfer' event.
        const transferEvent = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === 'Transfer';
            } catch (e) { return false; }
        });

        // Resolve the specific Token ID assigned to this new certificate
        const tokenId = transferEvent ? contract.interface.parseLog(transferEvent).args.tokenId.toString() : null;

        return {
            success: true,
            transactionHash: receipt.hash,
            tokenId: tokenId
        };
    } catch (error) {
        console.error("Blockchain Minting Error:", error);
        throw error;
    }
}

// Export the service methods
module.exports = { mintNFT };

