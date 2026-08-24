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
  res.status(err.status || 500).json({ message: err.message || 'Errore interno del server.' });
}

module.exports = errorHandler;
