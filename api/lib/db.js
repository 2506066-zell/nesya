const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const { Pool } = require('pg'); // Menggunakan Pool dari pg

let pool;

function getDbPool() {
  if (!pool) {
    console.log('Creating new PostgreSQL connection pool.');
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL, // Menggunakan POSTGRES_URL yang mendukung pooling
      ssl: {
        rejectUnauthorized: false // Diperlukan untuk koneksi ke Vercel/Neon
      }
    });
  }
  return pool;
}

module.exports = { getDbPool };