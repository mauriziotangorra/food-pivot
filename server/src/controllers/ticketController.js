const pool = require('../config/db');
const { generateUniqueTicketId } = require('../utils/ticketId');
const { toIso } = require('../utils/dates');

const STATUSES = ['Aperto', 'In Corso', 'Risolto'];

const TICKET_SELECT = `
  SELECT
    t.id,
    c.company_name AS customerName,
    ct.first_name  AS contactFirstName,
    ct.last_name   AS contactLastName,
    ct.phone       AS contactPhone,
    ct.email       AS contactEmail,
    p.name         AS productName,
    p.ifp_code     AS ifpCode,
    p.ean_code     AS eanCode,
    t.batch_number AS batchNumber,
    t.expiry_date  AS expiryDate,
    t.subject,
    t.status,
    t.created_at   AS createdAt,
    t.resolved_at  AS resolvedAt
  FROM tickets t
  JOIN customers c ON c.id = t.customer_id
  JOIN contacts ct  ON ct.id = t.contact_id
  JOIN products p   ON p.id = t.product_id
`;

function normalizeTicketInput(body = {}) {
  const errors = [];
  const data = {
    customerName: (body.customerName || '').trim(),
    contactFirstName: (body.contactFirstName || '').trim(),
    contactLastName: (body.contactLastName || '').trim(),
    contactPhone: (body.contactPhone || '').trim(),
    contactEmail: (body.contactEmail || '').trim().toLowerCase(),
    productName: (body.productName || '').trim(),
    ifpCode: (body.ifpCode || '').trim(),
    eanCode: (body.eanCode || '').trim(),
    expiryDate: (body.expiryDate || '').trim(),
    batchNumber: (body.batchNumber || '').trim(),
    subject: (body.subject || '').trim(),
    status: STATUSES.includes(body.status) ? body.status : 'Aperto',
  };

  if (!data.customerName) errors.push('Ragione sociale obbligatoria.');
  if (!data.contactFirstName) errors.push('Nome referente obbligatorio.');
  if (!data.contactLastName) errors.push('Cognome referente obbligatorio.');
  if (!data.contactPhone) errors.push('Telefono referente obbligatorio.');
  if (!data.contactEmail) errors.push('Email referente obbligatoria.');
  if (!data.productName) errors.push('Nome prodotto obbligatorio.');
  if (!data.ifpCode) errors.push('Codice IFP obbligatorio.');
  if (!data.eanCode) errors.push('Codice EAN obbligatorio.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.expiryDate)) errors.push('Data di scadenza non valida.');
  if (!data.batchNumber) errors.push('Numero di lotto obbligatorio.');
  if (!data.subject) errors.push('Oggetto della segnalazione obbligatorio.');

  return { errors, data };
}

async function findOrCreateCustomer(conn, companyName) {
  const [rows] = await conn.query('SELECT id FROM customers WHERE company_name = ?', [companyName]);
  if (rows.length) return rows[0].id;
  const [result] = await conn.query('INSERT INTO customers (company_name) VALUES (?)', [companyName]);
  return result.insertId;
}

async function findOrCreateContact(conn, customerId, data) {
  const params = [customerId, data.contactFirstName, data.contactLastName, data.contactPhone, data.contactEmail];
  const [rows] = await conn.query(
    'SELECT id FROM contacts WHERE customer_id=? AND first_name=? AND last_name=? AND phone=? AND email=?',
    params
  );
  if (rows.length) return rows[0].id;
  const [result] = await conn.query(
    'INSERT INTO contacts (customer_id, first_name, last_name, phone, email) VALUES (?,?,?,?,?)',
    params
  );
  return result.insertId;
}

async function findOrCreateProduct(conn, data) {
  const [rows] = await conn.query('SELECT id, name, ean_code AS eanCode FROM products WHERE ifp_code = ?', [data.ifpCode]);
  if (rows.length) {
    const existing = rows[0];
    if (existing.name !== data.productName || existing.eanCode !== data.eanCode) {
      await conn.query('UPDATE products SET name=?, ean_code=? WHERE id=?', [data.productName, data.eanCode, existing.id]);
    }
    return existing.id;
  }
  const [result] = await conn.query(
    'INSERT INTO products (name, ifp_code, ean_code) VALUES (?,?,?)',
    [data.productName, data.ifpCode, data.eanCode]
  );
  return result.insertId;
}

async function attachExtras(ticket) {
  const [followUpRows] = await pool.query(
    `SELECT f.id, f.note AS text, f.created_at AS createdAt, u.full_name AS userName
     FROM follow_ups f JOIN users u ON u.id = f.user_id
     WHERE f.ticket_id = ? ORDER BY f.created_at ASC`,
    [ticket.id]
  );
  const [attachmentRows] = await pool.query(
    `SELECT id, type, original_name AS name FROM attachments WHERE ticket_id = ? ORDER BY created_at ASC`,
    [ticket.id]
  );

  ticket.createdAt = toIso(ticket.createdAt);
  ticket.resolvedAt = toIso(ticket.resolvedAt);
  ticket.followUps = followUpRows.map((f) => ({ id: f.id, text: f.text, userName: f.userName, createdAt: toIso(f.createdAt) }));
  ticket.photos = attachmentRows.filter((a) => a.type === 'photo').map((a) => ({ id: a.id, name: a.name, url: `/api/attachments/${a.id}/file` }));
  ticket.reports = attachmentRows.filter((a) => a.type === 'report').map((a) => ({ id: a.id, name: a.name, url: `/api/attachments/${a.id}/file` }));
  ticket.supplierLetters = attachmentRows.filter((a) => a.type === 'supplier_letter').map((a) => ({ id: a.id, name: a.name, url: `/api/attachments/${a.id}/file` }));
  return ticket;
}

async function getTicketOr404(res, id) {
  const [rows] = await pool.query(`${TICKET_SELECT} WHERE t.id = ?`, [id]);
  if (!rows.length) {
    res.status(404).json({ message: 'Ticket non trovato.' });
    return null;
  }
  return attachExtras(rows[0]);
}

async function listTickets(req, res) {
  const { search = '', status = 'Tutti' } = req.query;
  const clauses = [];
  const params = [];

  if (search.trim()) {
    const like = `%${search.trim().toLowerCase()}%`;
    clauses.push('(LOWER(p.name) LIKE ? OR LOWER(c.company_name) LIKE ? OR LOWER(t.id) LIKE ?)');
    params.push(like, like, like);
  }
  if (status && status !== 'Tutti') {
    clauses.push('t.status = ?');
    params.push(status);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `${TICKET_SELECT} ${where} ORDER BY t.created_at DESC`,
    params
  );

  const ids = rows.map((r) => r.id);
  let counts = {};
  if (ids.length) {
    const [countRows] = await pool.query(
      `SELECT ticket_id AS ticketId, type, COUNT(*) AS cnt FROM attachments WHERE ticket_id IN (?) GROUP BY ticket_id, type`,
      [ids]
    );
    counts = countRows.reduce((acc, row) => {
      acc[row.ticketId] = acc[row.ticketId] || {};
      acc[row.ticketId][row.type] = row.cnt;
      return acc;
    }, {});
  }

  const result = rows.map((row) => ({
    ...row,
    createdAt: toIso(row.createdAt),
    resolvedAt: toIso(row.resolvedAt),
    photoCount: counts[row.id]?.photo || 0,
    reportCount: counts[row.id]?.report || 0,
    supplierLetterCount: counts[row.id]?.supplier_letter || 0,
  }));

  res.json(result);
}

async function getTicket(req, res) {
  const ticket = await getTicketOr404(res, req.params.id);
  if (ticket) res.json(ticket);
}

async function createTicket(req, res) {
  const { errors, data } = normalizeTicketInput(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const customerId = await findOrCreateCustomer(conn, data.customerName);
    const contactId = await findOrCreateContact(conn, customerId, data);
    const productId = await findOrCreateProduct(conn, data);
    const id = await generateUniqueTicketId(pool);
    const resolvedAt = data.status === 'Risolto' ? new Date() : null;

    await conn.query(
      `INSERT INTO tickets (id, customer_id, contact_id, product_id, batch_number, expiry_date, subject, status, created_by, resolved_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [id, customerId, contactId, productId, data.batchNumber, data.expiryDate, data.subject, data.status, req.user.id, resolvedAt]
    );
    await conn.commit();
    const ticket = await getTicketOr404(res, id);
    if (ticket) res.status(201).json(ticket);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function updateTicket(req, res) {
  const { id } = req.params;
  const [existingRows] = await pool.query('SELECT status, resolved_at AS resolvedAt FROM tickets WHERE id = ?', [id]);
  if (!existingRows.length) return res.status(404).json({ message: 'Ticket non trovato.' });

  const { errors, data } = normalizeTicketInput(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const existing = existingRows[0];
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const customerId = await findOrCreateCustomer(conn, data.customerName);
    const contactId = await findOrCreateContact(conn, customerId, data);
    const productId = await findOrCreateProduct(conn, data);

    let resolvedAt = existing.resolvedAt;
    if (data.status === 'Risolto' && existing.status !== 'Risolto') {
      resolvedAt = new Date();
    } else if (data.status !== 'Risolto') {
      resolvedAt = null;
    }

    await conn.query(
      `UPDATE tickets SET customer_id=?, contact_id=?, product_id=?, batch_number=?, expiry_date=?, subject=?, status=?, resolved_at=? WHERE id=?`,
      [customerId, contactId, productId, data.batchNumber, data.expiryDate, data.subject, data.status, resolvedAt, id]
    );
    await conn.commit();
    const ticket = await getTicketOr404(res, id);
    if (ticket) res.json(ticket);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function deleteTicket(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT id FROM tickets WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ message: 'Ticket non trovato.' });

  const [attachments] = await pool.query('SELECT stored_filename AS storedFilename, type FROM attachments WHERE ticket_id = ?', [id]);
  await pool.query('DELETE FROM tickets WHERE id = ?', [id]);

  const fs = require('fs');
  const path = require('path');
  const { UPLOAD_ROOT, TYPE_DIRS } = require('../middleware/upload');
  for (const att of attachments) {
    const filePath = path.join(UPLOAD_ROOT, TYPE_DIRS[att.type], att.storedFilename);
    fs.unlink(filePath, () => {});
  }

  res.status(204).send();
}

module.exports = { listTickets, getTicket, createTicket, updateTicket, deleteTicket, getTicketOr404 };
