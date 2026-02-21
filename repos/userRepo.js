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

async function updatePassword(email, password_hash) {
  const [result] = await pool.query(
    'UPDATE users SET password_hash = ? WHERE email = ?',
    [password_hash, email]
  );
  return result.affectedRows > 0;
}

module.exports = { 
  findByEmail, 
  createUser, 
  updatePassword
};