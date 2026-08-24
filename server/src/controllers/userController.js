const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function listUsers(req, res) {
  const [rows] = await pool.query(
    'SELECT id, full_name AS fullName, email, role, is_active AS isActive, created_at AS createdAt FROM users ORDER BY full_name'
  );
  res.json(rows);
}

async function createUser(req, res) {
  const { fullName, email, password, role } = req.body || {};
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Nome, email e password sono obbligatori.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'La password deve contenere almeno 8 caratteri.' });
  }
  const finalRole = role === 'admin' ? 'admin' : 'operator';

  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [fullName.trim(), email.trim().toLowerCase(), passwordHash, finalRole]
  );

  res.status(201).json({
    id: result.insertId,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    role: finalRole,
    isActive: true,
  });
}

async function setUserActive(req, res) {
  const { id } = req.params;
  const { isActive } = req.body || {};
  if (Number(id) === req.user.id) {
    return res.status(400).json({ message: 'Non puoi disattivare il tuo stesso account.' });
  }
  await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  res.json({ id: Number(id), isActive: !!isActive });
}

module.exports = { listUsers, createUser, setUserActive };
