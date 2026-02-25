const authService = require('../services/authService');

async function register(req, res) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function login(req, res) {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
}

async function resetPassword(req, res) {
  try {
    const success = await authService.resetPassword(req.body);
    res.json({ success, message: 'password_updated' });
  } catch (e) {
    const status = e.message === 'user_not_found' ? 404 : 400;
    res.status(status).json({ error: e.message });
  }
}

async function getProfile(req, res) {
  try {
    const user = await authService.getProfile(req.params.id);
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
}

async function updateProfile(req, res) {
  try {
    await authService.updateProfile(req.params.id, req.body);
    res.json({ message: 'profile_updated' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function deleteAccount(req, res) {
  try {
    await authService.deleteAccount(req.params.id);
    res.json({ message: 'account_deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { 
  register, 
  login, 
  resetPassword,
  getProfile,
  updateProfile,
  deleteAccount
};