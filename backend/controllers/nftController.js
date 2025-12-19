// Node.js file system module for handling local files
const fs = require('fs');
// Database connection pool
const dbPool = require('../db');
// Helper functions for Pinata (IPFS) interaction
const { pinFileToIPFS, pinJSONToIPFS } = require('../utils/pinataHelpers');
// Service for blockchain interaction (using Ethers.js)
const { mintNFT } = require('../services/blockchainService');

/**
 * Controller: issueNFT
 * Manages the entire lifecycle of creating an academic certificate NFT:
 * 1. File Upload to IPFS
 * 2. Metadata Creation & Upload
 * 3. Blockchain Minting
 * 4. Database Recording (linked across tables)
 */
async function issueNFT(req, res) {
    try {
        // --- 1. Extract Data from Request Body ---
        const { recipientId, title, description, department } = req.body;
        const file = req.file; // Provided by multer middleware

        // --- 2. Input Validation ---
        if (!file) {
            return res.status(400).json({ error: "Certificate file is required." });
        }
        if (!recipientId) {
            return res.status(400).json({ error: "Student (Recipient) is required." });
        }
        if (!title) {
            return res.status(400).json({ error: "Certificate Title is required." });
        }

        console.log(`[NFT Issue] Starting issuance for Student ID: ${recipientId}, Title: ${title}`);

        // --- 3. Retrieve Student's Wallet Address ---
        // We fetch the 'ethereum_address' that was generated for the student during registration.
        const studentResult = await dbPool.query("SELECT ethereum_address FROM students WHERE id = $1", [recipientId]);
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: "Student not found." });
        }
        const toAddress = studentResult.rows[0].ethereum_address;

        if (!toAddress) {
            return res.status(400).json({ error: "Student does not have a wallet address set." });
        }

        // --- 4. Upload Certificate Image to Pinata (IPFS) ---
        // Pining ensures the file persists on the decentralized web.
        const imageHash = await pinFileToIPFS(file.path);
        // Delete the temporary local file once it's successfully uploaded to IPFS
        fs.unlinkSync(file.path); 
        console.log(`[NFT Issue] Image pinned: ${imageHash}`);

        // --- 5. Create and Upload Metadata JSON to Pinata ---
        // Following the OpenSea/ERC-711 Metadata Standard for interoperability.
        const metadata = {
            name: title,
            description: description || "Issued by University Management System",
            image: `ipfs://${imageHash}`, // Link to the image pinned in Step 4
            attributes: [
                { trait_type: "Issuer", value: "University Admin" },
                { trait_type: "Department", value: department || "General" },
                { trait_type: "Date", value: new Date().toISOString() }
            ]
        };
        const metadataHash = await pinJSONToIPFS(metadata);
        const tokenURI = `ipfs://${metadataHash}`; // This URI is what gets stored on-chain
        console.log(`[NFT Issue] Metadata pinned: ${tokenURI}`);

        // --- 6. Minting Transaction on Blockchain ---
        // This process calls the smart contract and transfers ownership to the student.
        // It uses the administrative private key to authorize the transaction.
        const mintResult = await mintNFT(toAddress, tokenURI);
        console.log(`[NFT Issue] Minted Token ID: ${mintResult.tokenId} (Tx: ${mintResult.transactionHash})`);

        // --- 7. Save Records to Database ---
        
        // A. Insert human-readable certificate details
        const certQuery = `
            INSERT INTO certificates (recipient_id, title, description, department) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id
        `;
        const certResult = await dbPool.query(certQuery, [
            recipientId, 
            title, 
            description || "", 
            department || "General"
        ]);
        const certificateId = certResult.rows[0].id;

        // B. Link the minted NFT details (Transaction Hash, Token ID) to the Certificate record
        const nftQuery = `
            INSERT INTO nfts (certificate_id, token_id, transaction_hash, ipfs_cid)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        await dbPool.query(nftQuery, [
            certificateId,
            parseInt(mintResult.tokenId),
            mintResult.transactionHash,
            tokenURI // We use the metadata URI as the IPFS reference
        ]);

        // --- 8. Final Success Response ---
        res.status(201).json({
            message: "NFT issued successfully!",
            certificate: {
                id: certificateId,
                title: title,
                recipientId: recipientId
            },
            nft: {
                tokenId: mintResult.tokenId,
                transactionHash: mintResult.transactionHash,
                ipfsCid: tokenURI
            }
        });

    } catch (error) {
        console.error("Issue NFT Error:", error);
        // Attempt to clean up temp file if an error occurs mid-process
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message || "Failed to issue NFT." });
    }
}

// Export function as a module
module.exports = { issueNFT };

