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

module.exports = { 
  register, 
  login, 
  resetPassword 
};