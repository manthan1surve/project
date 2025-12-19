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
const nftRoutes = require("./routes/nftRoutes");

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// --- API ROUTES ---

// 1. NFT Routes (NEW MODULE)
app.use("/api/nft", nftRoutes);

// 2. Auth Routes
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
      const student = await getStudentById(req.user.id);
      if (!student) return res.status(404).json({ error: "User not found." });
      
      const fullProfile = await dbPool.query(
          "SELECT id, full_name, email, student_id_number, course_name, year, ethereum_address FROM students WHERE id = $1", 
          [req.user.id]
      );
      res.json(fullProfile.rows[0]);
  } catch (error) {
      console.error("Error fetching me:", error);
      res.status(500).json({ error: "Failed to fetch profile." });
  }
});


// 3. User & Admin Helpers


app.get("/api/certificates", authenticateToken, async (req, res) => {
    try {
        // Admin Helper: Get all certificates with recipient names
        // JOIN certificates -> students to get names
        // JOIN certificates -> nfts to get token_id/hash (optional, but good for history)
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

    // REFACTOR: Schema Alignment & JOIN Fix
    // We filter by 'recipient_id' in the 'certificates' table, which is linked to 'nfts.certificate_id'.
    // NOTE: We alias 'ipfs_cid' as 'token_uri' to keep the frontend happy.
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

    const assets = result.rows.map(row => {
      return {
        id: row.token_id, 
        tokenId: row.token_id,
        title: row.title || "Student NFT", // Use real title
        description: row.description,
        issueDate: row.issue_date,
        department: row.department,
        issuer: "University",
        imageUrl: row.token_uri ? row.token_uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : null,
        transactionHash: row.transaction_hash,
        ipfsCid: row.token_uri 
      };
    });

    res.json({
      user: { id: student.id, name: student.full_name },
      assets: assets,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ error: "Failed to fetch wallet assets." });
  }
});


app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});