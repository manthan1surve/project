const { ethers } = require('ethers');

const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;

if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.warn("⚠️ Blockchain configuration missing. Minting will fail.");
}

const ABI = [
    "function safeMint(address to, string memory _tokenURI) public",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

async function mintNFT(toAddress, tokenURI) {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const signer = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        console.log(`Minting NFT to ${toAddress}...`);
        const tx = await contract.safeMint(toAddress, tokenURI);
        const receipt = await tx.wait();

        // Extract Token ID from Transfer event
        const transferEvent = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === 'Transfer';
            } catch (e) { return false; }
        });

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

module.exports = { mintNFT };
