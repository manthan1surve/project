// Library for password hashing
const bcrypt = require('bcryptjs');
// Library for JSON Web Token generation
const jwt = require('jsonwebtoken');
// Database connection (Supabase Client)
const supabase = require('../db');
// Wallet utility for creating wallets during registration
const { createEncryptedWallet } = require('../walletService');
// Email service for notifications
const { sendWelcomeEmail } = require('../services/emailService');

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

    // Log Activity
    const { logActivity } = require('../services/activityLogger');
    logActivity({
        userId: user.id,
        action: 'REGISTER_STUDENT',
        details: `Registered ${user.email}`,
        req
    });

    // Send welcome email (non-blocking - don't wait for it)
    sendWelcomeEmail({ email: user.email, full_name: user.full_name })
      .then(result => {
        if (!result.success) console.warn('Welcome email failed:', result.error);
      });

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
            
            // Log Admin Login
            const { logActivity } = require('../services/activityLogger');
            logActivity({
                adminId: adminUser.id,
                action: 'LOGIN_ADMIN',
                details: 'Admin login successful',
                req
            });

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

    // Log Student Login
    const { logActivity } = require('../services/activityLogger');
    logActivity({
        userId: user.id,
        action: 'LOGIN_STUDENT',
        details: 'Student login successful',
        req
    });

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

/**
 * POST /api/auth/change-password
 * Allows logged-in users to change their password
 */
async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // From middleware

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new passwords are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    // 1. Get current user (student or admin)
    // Try students table first
    let table = 'students';
    let { data: user, error } = await supabase
      .from(table)
      .select('id, password')
      .eq('id', userId)
      .single();

    // If not found, try admins table
    if (!user) {
      table = 'admins';
      const result = await supabase
        .from(table)
        .select('id, password_hash') // Admin table uses password_hash
        .eq('id', userId)
        .single();
      
      user = result.data;
      error = result.error;
    }

    if (error || !user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 2. Verify Old Password
    const currentHash = user.password || user.password_hash;
    const isMatch = await bcrypt.compare(oldPassword, currentHash);

    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    // 3. Hash New Password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update Database
    const updatePayload = table === 'students' 
      ? { password: newHashedPassword } 
      : { password_hash: newHashedPassword };

    const { error: updateError } = await supabase
      .from(table)
      .update(updatePayload)
      .eq('id', userId);

    if (updateError) throw updateError;

    if (updateError) throw updateError;

    // Log Password Change
    const { logActivity } = require('../services/activityLogger');
    logActivity({
        userId: table === 'students' ? userId : null,
        adminId: table === 'admins' ? userId : null,
        action: 'CHANGE_PASSWORD',
        details: 'User changed their password',
        req
    });

    res.json({ message: "Password changed successfully." });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password." });
  }
}

// Export the controller methods for use in routing
module.exports = {
  register,
  login,
  changePassword
};



