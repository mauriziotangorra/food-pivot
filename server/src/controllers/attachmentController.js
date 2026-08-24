const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { UPLOAD_ROOT, TYPE_DIRS } = require('../middleware/upload');
const { getTicketOr404 } = require('./ticketController');

async function uploadAttachment(req, res) {
  const { id } = req.params;
  const type = req.query.type;

  const [ticketRows] = await pool.query('SELECT id FROM tickets WHERE id = ?', [id]);
  if (!ticketRows.length) return res.status(404).json({ message: 'Ticket non trovato.' });
  if (!req.file) return res.status(400).json({ message: 'Nessun file ricevuto.' });

  await pool.query(
    `INSERT INTO attachments (ticket_id, type, original_name, stored_filename, mime_type, size_bytes, uploaded_by)
     VALUES (?,?,?,?,?,?,?)`,
    [id, type, req.file.originalname, req.file.filename, req.file.mimetype, req.file.size, req.user.id]
  );

  const ticket = await getTicketOr404(res, id);
  if (ticket) res.status(201).json(ticket);
}

async function deleteAttachment(req, res) {
  const { id, attachmentId } = req.params;
  const [rows] = await pool.query(
    'SELECT id, type, stored_filename AS storedFilename FROM attachments WHERE id = ? AND ticket_id = ?',
    [attachmentId, id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Allegato non trovato.' });

  await pool.query('DELETE FROM attachments WHERE id = ?', [attachmentId]);
  const filePath = path.join(UPLOAD_ROOT, TYPE_DIRS[rows[0].type], rows[0].storedFilename);
  fs.unlink(filePath, () => {});

  const ticket = await getTicketOr404(res, id);
  if (ticket) res.json(ticket);
}

async function streamAttachment(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    'SELECT type, original_name AS originalName, stored_filename AS storedFilename, mime_type AS mimeType FROM attachments WHERE id = ?',
    [id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Allegato non trovato.' });

  const att = rows[0];
  const filePath = path.join(UPLOAD_ROOT, TYPE_DIRS[att.type], att.storedFilename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File non trovato sul server.' });

  res.setHeader('Content-Type', att.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(att.originalName)}"`);
  fs.createReadStream(filePath).pipe(res);
}

module.exports = { uploadAttachment, deleteAttachment, streamAttachment };
