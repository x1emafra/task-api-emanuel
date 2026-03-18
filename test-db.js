require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ CONEXIÓN OK!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ ERROR DB:', err.message);
    process.exit(1);
  });
