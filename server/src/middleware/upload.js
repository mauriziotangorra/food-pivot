const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_ROOT = path.resolve(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');

const TYPE_DIRS = {
  photo: 'photos',
  report: 'reports',
  supplier_letter: 'supplier_letters',
};

const ALLOWED_MIME = {
  photo: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  report: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  supplier_letter: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

const MAX_SIZE = {
  photo: 10 * 1024 * 1024,
  report: 15 * 1024 * 1024,
  supplier_letter: 15 * 1024 * 1024,
};

for (const dir of Object.values(TYPE_DIRS)) {
  fs.mkdirSync(path.join(UPLOAD_ROOT, dir), { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type;
    const dir = TYPE_DIRS[type];
    if (!dir) {
      const err = new Error('Tipo di allegato non valido.');
      err.status = 400;
      return cb(err);
    }
    cb(null, path.join(UPLOAD_ROOT, dir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const type = req.query.type;
    const allowed = ALLOWED_MIME[type];
    if (!allowed) {
      const err = new Error('Tipo di allegato non valido.');
      err.status = 400;
      return cb(err);
    }
    if (!allowed.includes(file.mimetype)) {
      const err = new Error('Formato file non supportato per questo tipo di allegato.');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

function enforceSizeForType(req, res, next) {
  const type = req.query.type;
  const max = MAX_SIZE[type];
  if (req.file && max && req.file.size > max) {
    fs.unlink(req.file.path, () => {});
    return res.status(413).json({
      message: `Il file supera la dimensione massima consentita (${Math.round(max / (1024 * 1024))}MB).`,
    });
  }
  next();
}

module.exports = { upload, enforceSizeForType, UPLOAD_ROOT, TYPE_DIRS };
