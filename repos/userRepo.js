const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

async function createUser({ id, email, password_hash, display_name }) {
  await pool.query(
    'INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)',
    [id, email, password_hash, display_name]
  );
  return { id, email, display_name };
}

module.exports = { findByEmail, createUser };