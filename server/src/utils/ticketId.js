const crypto = require('crypto');

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomSuffix(length = 6) {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }
  return result;
}

/**
 * Generates a unique ticket id like IFP-4F82A1, retrying on collision.
 */
async function generateUniqueTicketId(pool) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = `IFP-${randomSuffix()}`;
    const [rows] = await pool.query('SELECT id FROM tickets WHERE id = ?', [candidate]);
    if (rows.length === 0) return candidate;
  }
  throw new Error('Impossibile generare un identificativo protocollo univoco.');
}

module.exports = { generateUniqueTicketId };
