import pool from './db.js';
import bcrypt from 'bcryptjs';
import { loadEnv } from './env.js';

loadEnv();

async function seedAdmin() {
  const client = await pool.connect();
  
  try {
    // Check if admin already exists
    const existing = await client.query(
      "SELECT id FROM users WHERE role = 'admin' AND email = 'admin@swayamshield.com'"
    );
    
    if (existing.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create default admin user
    const password_hash = await bcrypt.hash('Admin@123456', 10);
    
    const result = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role`,
      ['admin@swayamshield.com', password_hash, 'System Admin', 'admin']
    );

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@swayamshield.com');
    console.log('🔐 Password: Admin@123456');
    console.log('\n⚠️  Please change this password after first login!');
  } catch (err) {
    console.error('❌ Error creating admin user:', err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedAdmin();
