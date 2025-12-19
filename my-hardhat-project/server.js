require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });

// --- Configuration & Constants ---
// Use environment variables for API keys
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_API_SECRET;
const PINATA_BASE_URL = "https://api.pinata.cloud/pinning";
const IPFS_PREFIX = "ipfs://";

// Pinata headers for authentication
const pinataAuthHeaders = {
  pinata_api_key: PINATA_API_KEY,
  pinata_secret_api_key: PINATA_SECRET_API_KEY,
};

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Allows server to parse JSON bodies from requests

// --- Pinata API Helper Functions ---
/**
 * Pins a file to IPFS via the Pinata API.
 * @param {string} filePath - The local path to the file.
 * @returns {string} The IPFS hash of the pinned file.
 */
async function pinFileToIPFS(filePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  const response = await axios.post(
    `${PINATA_BASE_URL}/pinFileToIPFS`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        ...pinataAuthHeaders,
      },
    }
  );
  return response.data.IpfsHash;
}

/**
 * Pins a JSON object to IPFS via the Pinata API.
 * @param {object} jsonMetadata - The metadata object to pin.
 * @returns {string} The IPFS hash of the pinned JSON.
 */
async function pinJSONToIPFS(jsonMetadata) {
  const response = await axios.post(
    `${PINATA_BASE_URL}/pinJSONToIPFS`,
    jsonMetadata,
    {
      headers: pinataAuthHeaders,
    }
  );
  return response.data.IpfsHash;
}

// --- Routes ---
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    // 1. Pin the image file to IPFS
    const imageIpfsHash = await pinFileToIPFS(file.path);
    // Remove the local file to clean up storage
    fs.unlinkSync(file.path);

    // 2. Create and pin the NFT metadata JSON
    const metadata = {
      name: "My Awesome NFT",
      description: "This NFT was created through my awesome app!",
      image: `${IPFS_PREFIX}${imageIpfsHash}`,
    };
    const metadataIpfsHash = await pinJSONToIPFS(metadata);

    // 3. Construct the final token URI
    const tokenURI = `${IPFS_PREFIX}${metadataIpfsHash}`;

    // 4. Send the response
    res.json({ success: true, tokenURI: tokenURI });
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    res
      .status(500)
      .json({ success: false, message: "Error uploading to Pinata. Check server logs for details." });
  }
});

// --- Server Startup ---
app.listen(3002, () => {
  console.log("✅ Server listening on port 3002");
});