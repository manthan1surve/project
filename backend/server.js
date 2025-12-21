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

// Import Supabase client
const supabase = require("./db");
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
      const { data: fullProfile, error } = await supabase
          .from('students')
          .select('id, full_name, email, student_id_number, course_name, year, ethereum_address')
          .eq('id', req.user.id)
          .single();
      
      if (error) throw error;
      
      // Respond with the full profile object
      res.json(fullProfile);
  } catch (error) {
      console.error("Error fetching me:", error);
      res.status(500).json({ error: "Failed to fetch profile." });
  }
});


// 3. User & Admin Helpers

// Admin route to get all certificates issued in the system
app.get("/api/certificates", authenticateToken, async (req, res) => {
    try {
        // Fetch certificates with related student and nft data
        const { data, error } = await supabase
            .from('certificates')
            .select(`
                id, 
                title, 
                department, 
                issue_date, 
                students (full_name),
                nfts (token_id, transaction_hash)
            `)
            .order('issue_date', { ascending: false });

        if (error) throw error;

        // Map to flat structure to match previous API response
        const mappedResults = data.map(c => ({
            id: c.id,
            title: c.title,
            department: c.department,
            created_at: c.issue_date,
            student_name: c.students?.full_name,
            token_id: c.nfts?.[0]?.token_id,
            transaction_hash: c.nfts?.[0]?.transaction_hash
        }));

        res.json(mappedResults);
    } catch (error) {
        console.error("Error fetching certificates:", error);
        res.status(500).json({ error: "Failed to fetch certificates." });
    }
});

// Admin route to fetch all registered students (useful for dropdowns)
app.get("/api/students", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, full_name, student_id_number, ethereum_address')
      .order('full_name', { ascending: true });

    if (error) throw error;

    // Map fields to match pre-existing aliases (name, roll, wallet)
    const mappedStudents = data.map(s => ({
        id: s.id,
        name: s.full_name,
        roll: s.student_id_number,
        wallet: s.ethereum_address
    }));
    
    res.json(mappedStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students." });
  }
});

// Helper function to fetch student by ID from database
// Helper function to fetch student by ID from database
async function getStudentById(id) {
  const { data, error } = await supabase
    .from('students')
    .select('id, full_name, email')
    .eq('id', id)
    .single();
    
  if (error) {
      console.error("getStudentById Error:", error);
      return null;
  }
  return data;
}

// 4. Custodial Wallet APIs

// Endpoint to create a new encrypted wallet for a student
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
    const { data, error } = await supabase
        .from('wallets')
        .upsert({
            user_id: student.id,
            public_address: address,
            encrypted_json: encryptedJson,
            updated_at: new Date()
        }, { onConflict: 'user_id' })
        .select('id, user_id, public_address')
        .single();

    if (error) throw error;

    // Send success response
    res.status(201).json({
      message: "Wallet created and stored successfully.",
      wallet: { id: data.id, public_address: data.public_address },
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({ error: "Failed to create wallet." });
  }
});

// Endpoint to fetch the student's encrypted wallet for client-side unlocking
// Endpoint to fetch the student's encrypted wallet for client-side unlocking
app.get("/api/wallet/me", authenticateToken, async (req, res) => {
  try {
    const student = await getStudentById(req.user.id);
    if (!student) return res.status(404).json({ error: "User not found." });

    const { data: wallet, error } = await supabase
        .from('wallets')
        .select('public_address, encrypted_json')
        .eq('user_id', student.id)
        .single();
        
    // .single() returns error if not found, we handle it gently
    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
        throw error;
    }

    if (!wallet) return res.status(404).json({ error: "No wallet found." });

    // Returns the encrypted keystore JSON to the client
    res.json({
      public_address: wallet.public_address,
      encrypted_json: wallet.encrypted_json,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: "Failed to fetch wallet." });
  }
});

// Endpoint to fetch all NFT assets (certificates) owned by the current student
// Endpoint to fetch all NFT assets (certificates) owned by the current student
app.get("/api/wallet/assets", authenticateToken, async (req, res) => {
  try {
    const student = await getStudentById(req.user.id);
    if (!student) return res.status(404).json({ error: "User not found." });

    // JOIN nfts and certificates via Supabase relations
    const { data, error } = await supabase
        .from('nfts')
        .select(`
            token_id, 
            transaction_hash, 
            ipfs_cid,
            certificates!inner (
                title,
                description,
                issue_date,
                department,
                recipient_id
            )
        `)
        .eq('certificates.recipient_id', student.id)
        .order('token_id', { ascending: false });

    if (error) throw error;

    // Map database results to frontend-friendly asset objects
    const assets = data.map(row => {
      const cert = row.certificates;
      return {
        id: row.token_id, 
        tokenId: row.token_id,
        title: cert.title || "Student NFT", 
        description: cert.description,
        issueDate: cert.issue_date,
        department: cert.department,
        issuer: "University",
        // Format IPFS URI as a Pinata gateway URL for easy image display
        imageUrl: row.ipfs_cid ? row.ipfs_cid.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : null,
        transactionHash: row.transaction_hash,
        ipfsCid: row.ipfs_cid 
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

// --- IPFS PROXY ---
// --- IPFS PROXY ---
// Relays IPFS requests to avoid CORS issues in the browser
// Fallback list of public gateways
const IPFS_GATEWAYS = [
    "https://gateway.pinata.cloud/ipfs/",
    "https://ipfs.io/ipfs/",
    "https://cf-ipfs.com/ipfs/",
    "https://dweb.link/ipfs/"
];

app.get("/api/ipfs/:cid", async (req, res) => {
    const { cid } = req.params;
    if (!cid) return res.status(400).send("CID is required");

    for (const gateway of IPFS_GATEWAYS) {
        try {
            const gatewayUrl = `${gateway}${cid}`;
            // console.log(`Attempting fetch from: ${gateway}`); // Optional debug
            
            const response = await axios.get(gatewayUrl, {
                responseType: 'stream',
                timeout: 5000 // 5s timeout per gateway
            });
            
            // If successful, pipe and exit
            res.setHeader('Content-Type', response.headers['content-type']);
            response.data.pipe(res);
            return;
            
        } catch (error) {
            // Continue to next gateway
            // console.error(`Failed ${gateway}: ${error.message}`);
        }
    }

    // If all fail
    console.error(`All gateways failed for CID: ${cid}`);
    res.status(502).send(`Failed to fetch IPFS content for ${cid}`);
});

// Start the server and listen for incoming HTTP requests
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
