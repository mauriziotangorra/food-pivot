const multer = require('multer');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Errore upload: ${err.message}` });
  }
  if (err && err.status) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Voce duplicata: la risorsa esiste già.' });
  }

  console.error(err);
  // Anything reaching here is an unexpected failure (DB connectivity, etc.) —
  // never forward its raw message to the client, it can leak internals
  // (connection strings, internal IPs, driver details).
  res.status(500).json({ message: 'Errore interno del server. Riprova più tardi.' });
}

module.exports = errorHandler;
