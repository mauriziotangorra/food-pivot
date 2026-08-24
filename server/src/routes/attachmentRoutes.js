const express = require('express');
const { streamAttachment } = require('../controllers/attachmentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:id/file', requireAuth, streamAttachment);

module.exports = router;
