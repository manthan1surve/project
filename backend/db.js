const { Pool } = require('pg');

const dbPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

dbPool.connect()
  .then(client => {
    console.log(`✅ Connected to PostgreSQL Database: ${process.env.DB_NAME}`);
    client.release();
  })
  .catch(err => {
    console.error('❌ Database Connection Failed:', err.message);
  });

module.exports = dbPool;

