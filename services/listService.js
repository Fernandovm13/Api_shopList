const listRepo = require('../repos/listRepo');
const userRepo = require('../repos/userRepo');
const { v4: uuidv4 } = require('uuid');

async function createNewList(name, ownerId) {
  return await listRepo.createList({ id: uuidv4(), name, owner_id: ownerId });
}

async function inviteCollaborator(listId, email) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new Error('user_not_found');
  await listRepo.addCollaborator(listId, user.id);
  return { success: true };
}

module.exports = { createNewList, inviteCollaborator };