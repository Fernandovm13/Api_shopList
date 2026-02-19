const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userRepo = require('../repos/userRepo');

async function register({ email, password, display_name }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new Error('email_exists');
  const hash = await bcrypt.hash(password, 10);
  return await userRepo.createUser({ id: uuidv4(), email, password_hash: hash, display_name });
}

async function login({ email, password }) {
  const user = await userRepo.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new Error('invalid_credentials');
  }
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '4h' });
  return { token, user: { id: user.id, display_name: user.display_name } };
}

function verifyToken(token) {
  try { return jwt.verify(token, process.env.JWT_SECRET); } catch { return null; }
}

module.exports = { register, login, verifyToken };