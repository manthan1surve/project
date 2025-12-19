const express = require('express');
const router = express.Router();
const multer = require('multer');
const { issueNFT } = require('../controllers/nftController');
const { authenticateToken } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// POST /api/nft/issue
// Authenticate token to ensure only admins can call this (for now it just needs any valid token)
router.post('/issue', authenticateToken, upload.single('file'), issueNFT);

module.exports = router;
