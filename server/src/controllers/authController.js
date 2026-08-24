const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e password sono obbligatorie.' });
  }

  const [rows] = await pool.query(
    'SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE email = ?',
    [email.trim().toLowerCase()]
  );
  const user = rows[0];
  if (!user || !user.is_active) {
    return res.status(401).json({ message: 'Credenziali non valide.' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ message: 'Credenziali non valide.' });
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );

  res.json({
    token,
    user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
  });
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, me };
