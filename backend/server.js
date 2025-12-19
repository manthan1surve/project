require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require('multer'); // From Upstream (Needed for file upload)
const axios = require('axios');   // From Upstream (Needed for Pinata)
const FormData = require('form-data'); // From Upstream
const fs = require('fs'); // From Upstream

// --- Your Modular Imports (From Stash) ---
const dbPool = require("./db");
const { createEncryptedWallet } = require("./walletService");
const { register, login } = require("./controllers/authController");
const { authenticateToken } = require("./middleware/authMiddleware");

const app = express();
const port = 3001;

// Setup Multer for uploads (From Upstream)
const upload = multer({ dest: 'uploads/' });

// --- Pinata Configuration (From Upstream) ---
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_API_SECRET;
const PINATA_BASE_URL = "https://api.pinata.cloud/pinning";

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// --- Pinata Helpers (From Upstream) ---
async function pinFileToIPFS(filePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  
  const response = await axios.post(`${PINATA_BASE_URL}/pinFileToIPFS`, formData, {
    headers: {
      ...formData.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });
  return response.data.IpfsHash;
}

async function pinJSONToIPFS(jsonMetadata) {
  const response = await axios.post(`${PINATA_BASE_URL}/pinJSONToIPFS`, jsonMetadata, {
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });
  return response.data.IpfsHash;
}

// --- API ROUTES ---

// 1. NFT Upload Route (KEPT FROM FRIEND'S CODE / UPSTREAM)
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded." });

    // Upload Image to IPFS
    const imageHash = await pinFileToIPFS(file.path);
    fs.unlinkSync(file.path); // Delete local temp file

    // Create Metadata
    const metadata = {
      name: "Student Certificate NFT",
      description: "Verification of Course Completion",
      image: `ipfs://${imageHash}`,
      attributes: [{ trait_type: "Type", value: "Academic" }]
    };

    // Upload Metadata to IPFS
    const metadataHash = await pinJSONToIPFS(metadata);
    
    res.json({ 
      success: true, 
      tokenURI: `ipfs://${metadataHash}` 
    });
  } catch (error) {
    console.error("IPFS Upload Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, message: "Failed to upload to Pinata." });
  }
});

// 2. Auth Routes (KEPT YOUR MODULAR CODE / STASH)
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

// 3. Wallet Helper
async function getStudentById(id) {
  const result = await dbPool.query(
    "SELECT id, full_name, email FROM students WHERE id = $1 LIMIT 1",
    [id]
  );
  return result.rows[0];
}

// 4. Wallet APIs (KEPT YOUR MODULAR CODE / STASH)
app.post("/api/wallet/create", authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required." });

    const student = await getStudentById(req.user.id);
    if (!student) return res.status(404).json({ error: "User not found." });

    const { address, encryptedJson } = await createEncryptedWallet(password);
    
    const query = `
      INSERT INTO wallets (user_id, public_address, encrypted_json)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id)
      DO UPDATE SET
        public_address = EXCLUDED.public_address,
        encrypted_json = EXCLUDED.encrypted_json,
        updated_at = NOW()
      RETURNING id, user_id, public_address;
    `;

    const result = await dbPool.query(query, [student.id, address, encryptedJson]);
    res.status(201).json({
      message: "Wallet created and stored successfully.",
      wallet: { id: result.rows[0].id, public_address: result.rows[0].public_address },
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({ error: "Failed to create wallet." });
  }
});

app.get("/api/wallet/me", authenticateToken, async (req, res) => {
  try {
    const student = await getStudentById(req.user.id);
    if (!student) return res.status(404).json({ error: "User not found." });

    const result = await dbPool.query(
      "SELECT public_address, encrypted_json FROM wallets WHERE user_id = $1 LIMIT 1",
      [student.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "No wallet found." });

    res.json({
      public_address: result.rows[0].public_address,
      encrypted_json: result.rows[0].encrypted_json,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: "Failed to fetch wallet." });
  }
});

app.get("/api/wallet/assets", authenticateToken, async (req, res) => {
  try {
    const student = await getStudentById(req.user.id);
    if (!student) return res.status(404).json({ error: "User not found." });

    // Placeholder mock assets
    const mockAssets = [
      { id: 1, title: "BSc Computer Science", issuer: "XYZ University", imageUrl: "..." },
      { id: 2, title: "Blockchain Workshop", issuer: "XYZ University", imageUrl: "..." },
    ];

    res.json({
      user: { id: student.id, name: student.full_name },
      assets: mockAssets,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ error: "Failed to fetch wallet assets." });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});