const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config)
      .then(pool => {
        console.log('Connected to Azure SQL Database');
        return pool;
      })
      .catch(err => {
        console.error('Database connection failed:', err.message);
        throw err;
      });
  }
  return poolPromise;
}

module.exports = { sql, getPool };
