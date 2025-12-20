const db = require('./db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';
    
    // Check if exists
    const check = await db.query("SELECT id FROM students WHERE email = $1", [email]);
    if (check.rows.length > 0) {
      console.log("⚠️ Admin user already exists.");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert Admin
    // We treat the admin as a 'Student' for auth purposes for now, 
    // since the auth system is single-table based.
    await db.query(
      `INSERT INTO students (
        full_name, 
        email, 
        password, 
        student_id_number, 
        course_name, 
        year, 
        ethereum_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'System Admin', 
        email, 
        hashedPassword, 
        'ADMIN001', 
        'Administration', 
        'Staff', 
        '0x0000000000000000000000000000000000000000' // Dummy address
      ]
    );

    console.log("✅ Admin user created successfully.");
    console.log("📧 Email: " + email);
    console.log("🔑 Password: " + password);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
  } finally {
    process.exit(); // Force exit to close pool
  }
}

seedAdmin();
