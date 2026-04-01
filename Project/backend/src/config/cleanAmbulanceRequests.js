import pool from './db.js';
import { loadEnv } from './env.js';

loadEnv();

async function cleanAmbulanceRequests() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Cleaning up old ambulance requests...\n');

    // Get all requests with NULL or invalid patient IDs
    const invalidRequests = await client.query(
      `SELECT id, patient_id, status, created_at FROM ambulance_requests WHERE patient_id IS NULL ORDER BY created_at`
    );

    if (invalidRequests.rows.length > 0) {
      console.log(`Found ${invalidRequests.rows.length} requests with NULL patient_id:`);
      invalidRequests.rows.forEach(req => {
        console.log(`  - Request: ${req.id.slice(0, 8)}..., Status: ${req.status}, Created: ${req.created_at}`);
      });

      // Delete them
      await client.query(`DELETE FROM ambulance_request_hospitals WHERE request_id IN (SELECT id FROM ambulance_requests WHERE patient_id IS NULL)`);
      await client.query(`DELETE FROM ambulance_requests WHERE patient_id IS NULL`);
      console.log(`✅ Deleted ${invalidRequests.rows.length} invalid requests\n`);
    } else {
      console.log('✅ No requests with NULL patient_id\n');
    }

    // Show remaining requests by patient
    const allRequests = await client.query(
      `
        SELECT ar.id, ar.patient_id, u.email, u.full_name, ar.status, ar.created_at
        FROM ambulance_requests ar
        LEFT JOIN users u ON ar.patient_id = u.id
        ORDER BY u.email, ar.created_at DESC
      `
    );

    if (allRequests.rows.length > 0) {
      console.log('📋 Remaining ambulance requests by patient:');
      let currentEmail = null;
      allRequests.rows.forEach(req => {
        if (req.email !== currentEmail) {
          currentEmail = req.email;
          console.log(`\n  ${req.email || 'UNKNOWN'} (${req.full_name || 'N/A'}):`);
        }
        console.log(`    - ${req.id.slice(0, 8)}... [${req.status}] - ${req.created_at}`);
      });
    } else {
      console.log('✅ No ambulance requests in the database');
    }

    console.log('\n✅ Cleanup complete!');
  } catch (err) {
    console.error('❌ Error during cleanup:', err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

cleanAmbulanceRequests();
