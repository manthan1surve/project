const fs = require('fs');
const dbPool = require('../db');
const { pinFileToIPFS, pinJSONToIPFS } = require('../utils/pinataHelpers');
const { mintNFT } = require('../services/blockchainService');

async function issueNFT(req, res) {
    try {
        // 1. Extract Data from Request Body (Explicit Destructuring)
        const { recipientId, title, description, department } = req.body;
        const file = req.file;

        // 2. Validation
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

        // 3. Get Student Wallet Address
        const studentResult = await dbPool.query("SELECT ethereum_address FROM students WHERE id = $1", [recipientId]);
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: "Student not found." });
        }
        const toAddress = studentResult.rows[0].ethereum_address;

        if (!toAddress) {
            return res.status(400).json({ error: "Student does not have a wallet address set." });
        }

        // 4. Upload Image to Pinata (IPFS)
        const imageHash = await pinFileToIPFS(file.path);
        fs.unlinkSync(file.path); // Delete local temp file
        console.log(`[NFT Issue] Image pinned: ${imageHash}`);

        // 5. Create and Upload Metadata to Pinata
        const metadata = {
            name: title,
            description: description || "Issued by University Management System",
            image: `ipfs://${imageHash}`,
            attributes: [
                { trait_type: "Issuer", value: "University Admin" },
                { trait_type: "Department", value: department || "General" },
                { trait_type: "Date", value: new Date().toISOString() }
            ]
        };
        const metadataHash = await pinJSONToIPFS(metadata);
        const tokenURI = `ipfs://${metadataHash}`;
        console.log(`[NFT Issue] Metadata pinned: ${tokenURI}`);

        // 6. Mint on Blockchain
        // This uses the Admin's private key to sign the transaction
        const mintResult = await mintNFT(toAddress, tokenURI);
        console.log(`[NFT Issue] Minted Token ID: ${mintResult.tokenId} (Tx: ${mintResult.transactionHash})`);

        // 7. Save to Database (Multi-Table Transaction)
        // Step A: Create Certificate Record
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

        // Step B: Create NFT Record linked to Certificate
        // We use ipfs_cid as the source of truth for the token_uri
        const nftQuery = `
            INSERT INTO nfts (certificate_id, token_id, transaction_hash, ipfs_cid)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const dbResult = await dbPool.query(nftQuery, [
            certificateId,
            parseInt(mintResult.tokenId),
            mintResult.transactionHash,
            tokenURI 
        ]);

        // 8. Success Response
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
        res.status(500).json({ error: error.message || "Failed to issue NFT." });
    }
}

module.exports = { issueNFT };
