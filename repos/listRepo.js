const pool = require('../config/db');

async function createList({ id, name, owner_id }) {
  await pool.query('INSERT INTO pantry_lists (id, name, owner_id) VALUES (?, ?, ?)', [id, name, owner_id]);
  await pool.query('INSERT INTO list_collaborators (list_id, user_id) VALUES (?, ?)', [id, owner_id]);
  return { id, name, owner_id };
}

async function addCollaborator(listId, userId) {
  await pool.query('INSERT IGNORE INTO list_collaborators (list_id, user_id) VALUES (?, ?)', [listId, userId]);
}

async function isCollaborator(listId, userId) {
  const [rows] = await pool.query('SELECT * FROM list_collaborators WHERE list_id = ? AND user_id = ?', [listId, userId]);
  return rows.length > 0;
}

async function getListsByUser(userId) {
  const [rows] = await pool.query(
    `SELECT l.* FROM pantry_lists l 
     JOIN list_collaborators lc ON l.id = lc.list_id 
     WHERE lc.user_id = ?`, [userId]
  );
  return rows;
}

module.exports = { createList, addCollaborator, isCollaborator, getListsByUser };