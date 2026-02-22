const pool = require('../config/db');

async function getItemsByList(listId) {
  const [rows] = await pool.query(
    'SELECT * FROM items WHERE list_id = ? AND deleted = 0', 
    [listId]
  );
  return rows;
}

async function insertItem({ id, listId, title, quantity, note, created_by }) {
  await pool.query(
    'INSERT INTO items (id, list_id, title, quantity, note, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [id, listId, title, quantity, note, created_by]
  );
  return await getItem(id);
}

async function updateItem(id, changes, baseVersion) {
  const { title, quantity, note, status, deleted } = changes;

  const [res] = await pool.query(
    `UPDATE items SET 
      title = COALESCE(?, title), 
      quantity = COALESCE(?, quantity), 
      note = COALESCE(?, note), 
      status = COALESCE(?, status),
      deleted = COALESCE(?, deleted), 
      version = version + 1 
     WHERE id = ? AND version = ?`,
    [
      title || null, 
      quantity || null, 
      note || null, 
      status || null, 
      deleted !== undefined ? deleted : null, 
      id, 
      baseVersion
    ]
  );
  
  return res.affectedRows === 1;
}

async function getItem(id) {
  const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
  return rows[0];
}

module.exports = { 
  getItemsByList, 
  insertItem, 
  updateItem, 
  getItem 
};