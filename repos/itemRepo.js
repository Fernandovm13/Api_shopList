const pool = require('../config/db');

/**
 * Obtiene solo los ítems activos (no borrados) de una lista específica.
 * Esto asegura que lo que el usuario "borró" no aparezca en la App.
 */
async function getItemsByList(listId) {
  const [rows] = await pool.query(
    'SELECT * FROM items WHERE list_id = ? AND deleted = 0', 
    [listId]
  );
  return rows;
}

/**
 * Inserta un nuevo ítem en la base de datos.
 */
async function insertItem({ id, listId, title, quantity, note, created_by }) {
  await pool.query(
    'INSERT INTO items (id, list_id, title, quantity, note, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [id, listId, title, quantity, note, created_by]
  );
  return await getItem(id);
}

/**
 * Actualiza uno o varios campos de un ítem.
 * Soporta cambios en título, cantidad, nota, estado y borrado lógico.
 * Utiliza el control de versiones para evitar conflictos de edición.
 */
async function updateItem(id, changes, baseVersion) {
  // Extraemos los campos del objeto de cambios
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
  
  // Retorna true si se actualizó el registro (coincidió ID y Versión)
  return res.affectedRows === 1;
}

/**
 * Obtiene un ítem específico por su ID.
 */
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