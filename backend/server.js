require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const port = 3001;
const upload = multer({ dest: 'uploads/' });

// --- Database Setup ---
const dbPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// --- Pinata Configuration ---
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_API_SECRET;
const PINATA_BASE_URL = "https://api.pinata.cloud/pinning";

app.use(cors());
app.use(express.json());

// --- Pinata Helpers ---
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

// --- Routes ---

// NFT Upload Route (This handles the IPFS part)
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded." });

    // 1. Upload Image to IPFS
    const imageHash = await pinFileToIPFS(file.path);
    fs.unlinkSync(file.path); // Delete local temp file

    // 2. Create Metadata
    const metadata = {
      name: "Student Certificate NFT",
      description: "Verification of Course Completion",
      image: `ipfs://${imageHash}`,
      attributes: [{ trait_type: "Type", value: "Academic" }]
    };

    // 3. Upload Metadata to IPFS
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

// Student Registration Route (This handles the DB part)
app.post('/api/register-student', async (req, res) => {
  try {
    const { fullName, studentId, courseName, year, ethAddress } = req.body;
    const placeholderClerkId = `manual_${studentId}_${Date.now()}`;
    
    const newStudent = await dbPool.query(
      `INSERT INTO students (full_name, student_id_number, course_name, year, ethereum_address, clerk_user_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [fullName, studentId, courseName, year, ethAddress, placeholderClerkId]
    );
    
    res.status(201).json({ message: 'Student registered in database!', student: newStudent.rows[0] });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: 'Database registration failed.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});