import pool from './db.js';
import { loadEnv } from './env.js';

loadEnv();

async function deleteAllAmbulanceRequests() {
  try {
    console.log('🗑️  Deleting ALL ambulance requests from the database...\n');

    // Delete ambulance_request_hospitals first (foreign key dependency)
    const hospitalsDeleted = await pool.query(`DELETE FROM ambulance_request_hospitals`);
    console.log(`✅ Deleted ${hospitalsDeleted.rowCount} ambulance_request_hospitals records`);

    // Delete ambulance_requests
    const requestsDeleted = await pool.query(`DELETE FROM ambulance_requests`);
    console.log(`✅ Deleted ${requestsDeleted.rowCount} ambulance_requests records`);

    console.log('\n✅ All ambulance requests have been deleted!');
    console.log('🔄 Now both patients will see 0 active requests when they refresh.\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during deletion:', err.message);
    process.exit(1);
  }
}

deleteAllAmbulanceRequests();
