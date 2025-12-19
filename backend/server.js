// Load environment variables from .env file
require("dotenv").config();
// Initialize Express framework
const express = require("express");
// Enable Cross-Origin Resource Sharing (allows frontend to access the API)
const cors = require("cors");
// Middleware for handling file uploads
const multer = require('multer'); 
// HTTP client for making external requests (e.g. to IPFS)
const axios = require('axios');   
// Helper for formatting form data (used in IPFS uploads)
const FormData = require('form-data'); 
// Node.js file system module
const fs = require('fs'); 

// Import custom database connection pool
const dbPool = require("./db");
// Import wallet creation utility
const { createEncryptedWallet } = require("./walletService");
// Import authentication logic (registration and login)
const { register, login } = require("./controllers/authController");
// Import middleware to protect private routes
const { authenticateToken } = require("./middleware/authMiddleware");
// Import NFT-specific routes
const nftRoutes = require("./routes/nftRoutes");

// Create Express application instance
const app = express();
// Server port configuration
const port = 3001;

// CORS configuration to allow local frontend access
// CORS CONFIGURATION
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'], // Allow explicit origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Parse incoming JSON request bodies
app.use(express.json());

// --- API ROUTES ---

// 1. NFT-related endpoints (Minting, Issuance)
app.use("/api/nft", nftRoutes);

// 2. Authentication endpoints
// Public registration route
app.post("/api/auth/register", register);
// Public login route
app.post("/api/auth/login", login);

// Private route to get current user's profile
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
      // Fetch basic student info from DB using ID from middleare
      const student = await getStudentById(req.user.id);
      if (!student) return res.status(404).json({ error: "User not found." });
      
      // Fetch extended profile details
      const fullProfile = await dbPool.query(
          "SELECT id, full_name, email, student_id_number, course_name, year, ethereum_address FROM students WHERE id = $1", 
          [req.user.id]
      );
      // Respond with the full profile object
      res.json(fullProfile.rows[0]);
  } catch (error) {
      console.error("Error fetching me:", error);
      res.status(500).json({ error: "Failed to fetch profile." });
  }
});


// 3. User & Admin Helpers

// Admin route to get all certificates issued in the system
app.get("/api/certificates", authenticateToken, async (req, res) => {
    try {
        // Complex query joining certificates, students, and NFTs to show full history
        const query = `
            SELECT 
                c.id, 
                c.title, 
                c.department, 
                c.issue_date AS created_at, 
                s.full_name AS student_name,
                n.token_id,
                n.transaction_hash
            FROM certificates c
            JOIN students s ON c.recipient_id = s.id
            LEFT JOIN nfts n ON c.id = n.certificate_id
            ORDER BY c.issue_date DESC
        `;
        const result = await dbPool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching certificates:", error);
        res.status(500).json({ error: "Failed to fetch certificates." });
    }
});

// Admin route to fetch all registered students (useful for dropdowns)
app.get("/api/students", authenticateToken, async (req, res) => {
  try {
    const result = await dbPool.query(
      "SELECT id, full_name as name, student_id_number as roll, ethereum_address as wallet FROM students ORDER BY full_name ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students." });
  }
});

// Helper function to fetch student by ID from database
async function getStudentById(id) {
  const result = await dbPool.query(
    "SELECT id, full_name, email FROM students WHERE id = $1 LIMIT 1",
    [id]
  );
  return result.rows[0];
}

// 4. Custodial Wallet APIs

// Endpoint to create a new encrypted wallet for a student
app.post("/api/wallet/create", authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    // Password required for server-side encryption
    if (!password) return res.status(400).json({ error: "Password is required." });

    const student = await getStudentById(req.user.id);
    if (!student) return res.status(404).json({ error: "User not found." });

    // Generate new Ethereum wallet and encrypt with user's password
    const { address, encryptedJson } = await createEncryptedWallet(password);
    
    // Upsert the wallet into the database linked to the student
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
    // Send success response
    res.status(201).json({
      message: "Wallet created and stored successfully.",
      wallet: { id: result.rows[0].id, public_address: result.rows[0].public_address },
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({ error: "Failed to create wallet." });
  }
});

// Endpoint to fetch the student's encrypted wallet for client-side unlocking
app.get("/api/wallet/me", authenticateToken, async (req, res) => {
  try {
    const student = await getStudentById(req.user.id);
    if (!student) return res.status(404).json({ error: "User not found." });

    const result = await dbPool.query(
      "SELECT public_address, encrypted_json FROM wallets WHERE user_id = $1 LIMIT 1",
      [student.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "No wallet found." });

    // Returns the encrypted keystore JSON to the client
    res.json({
      public_address: result.rows[0].public_address,
      encrypted_json: result.rows[0].encrypted_json,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: "Failed to fetch wallet." });
  }
});

// Endpoint to fetch all NFT assets (certificates) owned by the current student
app.get("/api/wallet/assets", authenticateToken, async (req, res) => {
  try {
    const student = await getStudentById(req.user.id);
    if (!student) return res.status(404).json({ error: "User not found." });

    // JOIN nfts and certificates tables to get metadata for the student's tokens
    const query = `
      SELECT 
        n.token_id, 
        n.transaction_hash, 
        n.ipfs_cid AS token_uri,
        c.title,
        c.description,
        c.issue_date,
        c.department
      FROM nfts n
      JOIN certificates c ON n.certificate_id = c.id
      WHERE c.recipient_id = $1
      ORDER BY n.token_id DESC
    `;
    
    const result = await dbPool.query(query, [student.id]);

    // Map database results to frontend-friendly asset objects
    const assets = result.rows.map(row => {
      return {
        id: row.token_id, 
        tokenId: row.token_id,
        title: row.title || "Student NFT", 
        description: row.description,
        issueDate: row.issue_date,
        department: row.department,
        issuer: "University",
        // Format IPFS URI as a Pinata gateway URL for easy image display
        imageUrl: row.token_uri ? row.token_uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : null,
        transactionHash: row.transaction_hash,
        ipfsCid: row.token_uri 
      };
    });

    // Send the list of assets back to the wallet dashboard
    res.json({
      user: { id: student.id, name: student.full_name },
      assets: assets,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ error: "Failed to fetch wallet assets." });
  }
});

// Start the server and listen for incoming HTTP requests
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
