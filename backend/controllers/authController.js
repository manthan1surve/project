// Library for password hashing
const bcrypt = require('bcryptjs');
// Library for JSON Web Token generation
const jwt = require('jsonwebtoken');
// Database connection (Supabase Client)
const supabase = require('../db');
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

    // Check if a user with this email already exists
    const { data: existing, error: existError } = await supabase
        .from('students')
        .select('id')
        .eq('email', email)
        .single();
    
    // .single() returns error if 0 rows (PGRST116), so we check if data exists
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Generate a new custodial wallet for the student immediately upon registration
    const { address, encryptedJson } = await createEncryptedWallet(password);

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- SEQUENTIAL WRITE (Mimicking Transaction) ---
    // 1. Insert Student
    const { data: newUser, error: studentError } = await supabase
        .from('students')
        .insert([{
            email, 
            password: hashedPassword, 
            full_name, 
            student_id_number, 
            course_name, 
            year, 
            ethereum_address: address
        }])
        .select()
        .single();

    if (studentError) {
        throw new Error(`Student Insert Failed: ${studentError.message}`);
    }

    const user = newUser;

    // 2. Insert Wallet
    const { error: walletError } = await supabase
        .from('wallets')
        .insert([{
            user_id: user.id,
            public_address: address,
            encrypted_json: encryptedJson
        }]);

    if (walletError) {
        // Rollback attempt: Delete user if wallet creation fails
        await supabase.from('students').delete().eq('id', user.id);
        throw new Error(`Wallet Insert Failed: ${walletError.message}`);
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
    res.status(500).json({ error: error.message || 'Registration failed.' });
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

    // --- BACKUP ADMIN (Hardcoded) ---
    if (email === 'backup_admin@test.com' && password === 'admin_backup_123') {
        const adminToken = signToken({ id: 'backup-admin-id', email, role: 'admin' });
        return res.json({
             message: 'Backup Admin Login successful.',
             token: adminToken,
             user: {
               id: 'backup-admin-id',
               email: email,
               full_name: 'Backup Admin',
               role: 'admin'
             }
        });
    }

    // --- ADMIN LOGIN (DB Check) ---
    // 1. Check 'admins' table
    const { data: adminUser, error: adminError } = await supabase
        .from('admins')
        .select('id, email, password_hash, username, role')
        .eq('email', email)
        .single();
    
    // Only proceed if an admin user is found (ignore "row not found" error safely by checking data)
    if (adminUser) {
        // Verify Password
        const isAdminMatch = await bcrypt.compare(password, adminUser.password_hash);
        
        if (isAdminMatch) {
            const adminToken = signToken({ id: adminUser.id, email: adminUser.email, role: adminUser.role });
            return res.json({
                 message: 'Admin Login successful.',
                 token: adminToken,
                 user: {
                   id: adminUser.id,
                   email: adminUser.email,
                   full_name: adminUser.username || 'Admin',
                   role: adminUser.role
                 }
            });
        }
    }
    // -------------------------

    // Look up student record from database by email
    const { data: user, error } = await supabase
        .from('students')
        .select('id, email, full_name, password')
        .eq('email', email)
        .single();

    // Check if user was found
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

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



