require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seed() {
  const name = process.env.ADMIN_NAME || 'Amministratore';
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL e ADMIN_PASSWORD devono essere impostati nel file .env');
    process.exit(1);
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    console.log(`Un utente con email ${email} esiste già. Nessuna azione eseguita.`);
    await pool.end();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    'INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)',
    [name, email, passwordHash, 'admin']
  );

  console.log(`Utente amministratore creato: ${email}`);
  await pool.end();
}

seed().catch((error) => {
  console.error('Errore durante il seeding:', error);
  process.exit(1);
});
