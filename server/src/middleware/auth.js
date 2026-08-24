const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  // Query-param fallback lets <img>/<a> tags load authenticated files, which can't set headers.
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.token || null;
  if (!token) {
    return res.status(401).json({ message: 'Autenticazione richiesta.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, full_name, email, role, is_active FROM users WHERE id = ?',
      [payload.sub]
    );
    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Utente non valido o disattivato.' });
    }
    req.user = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token non valido o scaduto.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Operazione riservata agli amministratori.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
