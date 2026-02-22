const listService = require('../services/listService');
const listRepo = require('../repos/listRepo');
const itemRepo = require('../repos/itemRepo');
const crypto = require('crypto');

async function getUserLists(req, res) {
  try {
    const lists = await listRepo.getListsByUser(req.query.userId);
    res.json(lists);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function createList(req, res) {
  try {
    const list = await listService.createNewList(req.body.name, req.body.owner_id);
    res.status(201).json(list);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function invite(req, res) {
  try {
    await listService.inviteCollaborator(req.params.id, req.body.email);
    res.json({ message: 'Invitación enviada' });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
}

async function getItems(req, res) {
  try {
    const items = await itemRepo.getItemsByList(req.params.id);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function addItem(req, res) {
  try {
    const { title, quantity, note, created_by } = req.body;
    const listId = req.params.id;

    const newItem = await itemRepo.insertItem({
      id: crypto.randomUUID(),
      listId,
      title,
      quantity,
      note,
      created_by
    });

    res.status(201).json(newItem);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function updateList(req, res) {
  try {
    const success = await listRepo.updateList(req.params.id, req.body.name);
    if (success) res.json({ message: 'Lista actualizada correctamente' });
    else res.status(404).json({ error: 'Lista no encontrada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function deleteList(req, res) {
  try {
    const success = await listRepo.deleteList(req.params.id);
    if (success) res.json({ message: 'Lista eliminada' });
    else res.status(404).json({ error: 'Lista no encontrada' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function updateItem(req, res) {
  try {
    const { title, quantity, note, version } = req.body;
    const success = await itemRepo.updateItem(
      req.params.id, 
      { title, quantity, note }, 
      version || 0
    );
    if (success) res.json({ message: 'Item actualizado correctamente' });
    else res.status(409).json({ error: 'Error de versión o item no encontrado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function getPendingInvitations(req, res) {
  try {
    const invitations = await listRepo.getPendingInvitations(req.params.userId);
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function respondToInvitation(req, res) {
  const { listId, userId, accept } = req.body;
  if (!listId || !userId || accept === undefined) {
    return res.status(400).json({ error: "Faltan datos requeridos (listId, userId, accept)" });
  }
  try {
    await listRepo.respondToInvitation(listId, userId, accept);
    res.json({ message: accept ? "Invitación aceptada" : "Invitación rechazada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { 
  getUserLists, 
  createList, 
  invite, 
  getItems, 
  addItem, 
  updateList, 
  deleteList, 
  updateItem,
  getPendingInvitations, 
  respondToInvitation    
};