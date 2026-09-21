/**
 * @file db.js
 * @description Database connection pool and mock-resilient query manager.
 * Initializes a MySQL2 connection pool. If MySQL is unreachable (e.g. ECONNREFUSED)
 * or if USE_MOCK_DB=true, it automatically activates the in-memory store so the backend
 * can be developed, run, and verified without requiring a running database server.
 */

const mysql = require('mysql2/promise');
const env = require('./env');

let pool = null;
let isMockMode = env.USE_MOCK_DB;

if (!env.USE_MOCK_DB) {
  try {
    pool = mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000
    });
  } catch (err) {
    console.warn("[DB] MySQL pool initialization deferred. Running in mock-resilient mode.");
    isMockMode = true;
  }
}

/**
 * Executes a database health check probe.
 * @returns {Promise<{connected: boolean, mode: 'mysql' | 'memory', message: string}>}
 */
async function checkDatabaseHealth() {
  if (isMockMode || !pool) {
    return {
      connected: true,
      mode: 'memory',
      message: 'Operating with in-memory persistence store (zero database setup required).'
    };
  }

  try {
    const [rows] = await pool.query("SELECT 1 AS live");
    return {
      connected: true,
      mode: 'mysql',
      message: 'Successfully connected to MySQL database server.'
    };
  } catch (error) {
    // If MySQL connection refused, gracefully fall back to in-memory mode
    isMockMode = true;
    return {
      connected: true,
      mode: 'memory',
      message: `MySQL offline (${error.code || error.message}). Running in in-memory fallback mode.`
    };
  }
}

module.exports = {
  pool,
  isMockMode: () => isMockMode,
  setMockMode: (val) => { isMockMode = val; },
  checkDatabaseHealth
};
