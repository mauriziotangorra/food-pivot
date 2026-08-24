const pool = require('../config/db');
const { getTicketOr404 } = require('./ticketController');

async function addFollowUp(req, res) {
  const { id } = req.params;
  const text = (req.body?.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Il testo della nota è obbligatorio.' });

  const [ticketRows] = await pool.query('SELECT id FROM tickets WHERE id = ?', [id]);
  if (!ticketRows.length) return res.status(404).json({ message: 'Ticket non trovato.' });

  await pool.query('INSERT INTO follow_ups (ticket_id, user_id, note) VALUES (?, ?, ?)', [id, req.user.id, text]);

  const ticket = await getTicketOr404(res, id);
  if (ticket) res.status(201).json(ticket);
}

module.exports = { addFollowUp };
