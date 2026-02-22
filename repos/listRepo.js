const pool = require('../config/db');

async function createList({ id, name, owner_id }) {
  await pool.query('INSERT INTO pantry_lists (id, name, owner_id) VALUES (?, ?, ?)', [id, name, owner_id]);
  await pool.query('INSERT INTO list_collaborators (list_id, user_id, status) VALUES (?, ?, "accepted")', [id, owner_id]);
  return { id, name, owner_id };
}

async function addCollaborator(listId, userId) {
  await pool.query('INSERT IGNORE INTO list_collaborators (list_id, user_id, status) VALUES (?, ?, "pending")', [listId, userId]);
}

async function isCollaborator(listId, userId) {
  const [rows] = await pool.query('SELECT * FROM list_collaborators WHERE list_id = ? AND user_id = ?', [listId, userId]);
  return rows.length > 0;
}

async function getListsByUser(userId) {
  const [rows] = await pool.query(
    `SELECT 
        l.*, 
        COUNT(i.id) AS total_items,
        SUM(CASE WHEN i.status = 'completed' AND i.deleted = 0 THEN 1 ELSE 0 END) AS completed_items,
        GREATEST(
            l.created_at, 
            IFNULL((SELECT MAX(updated_at) FROM items WHERE list_id = l.id), l.created_at)
        ) AS updated_at
     FROM pantry_lists l
     JOIN list_collaborators lc ON l.id = lc.list_id
     LEFT JOIN items i ON l.id = i.list_id AND i.deleted = 0
     WHERE lc.user_id = ? AND lc.status = 'accepted'
     GROUP BY l.id
     ORDER BY updated_at DESC`, 
    [userId]
  );
  return rows;
}

async function getPendingInvitations(userId) {
  const [rows] = await pool.query(
    `SELECT l.*, u.display_name AS owner_name
     FROM pantry_lists l
     JOIN list_collaborators lc ON l.id = lc.list_id
     JOIN users u ON l.owner_id = u.id
     WHERE lc.user_id = ? AND lc.status = "pending"`, 
    [userId]
  );
  return rows;
}

async function respondToInvitation(listId, userId, accept) {
  if (accept) {
    const [res] = await pool.query(
      'UPDATE list_collaborators SET status = "accepted" WHERE list_id = ? AND user_id = ?',
      [listId, userId]
    );
    return res.affectedRows > 0;
  } else {
    const [res] = await pool.query(
      'DELETE FROM list_collaborators WHERE list_id = ? AND user_id = ?',
      [listId, userId]
    );
    return res.affectedRows > 0;
  }
}

async function updateList(id, name) {
  const [res] = await pool.query('UPDATE pantry_lists SET name = ? WHERE id = ?', [name, id]);
  return res.affectedRows > 0;
}

async function deleteList(id) {
  await pool.query('DELETE FROM list_collaborators WHERE list_id = ?', [id]);
  await pool.query('DELETE FROM items WHERE list_id = ?', [id]);
  const [res] = await pool.query('DELETE FROM pantry_lists WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

module.exports = { 
  createList, 
  addCollaborator, 
  isCollaborator, 
  getListsByUser, 
  getPendingInvitations,
  respondToInvitation,
  updateList, 
  deleteList 
};