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

module.exports = { register, login };