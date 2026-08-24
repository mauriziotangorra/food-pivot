const express = require('express');
const { listTickets, getTicket, createTicket, updateTicket, deleteTicket } = require('../controllers/ticketController');
const { addFollowUp } = require('../controllers/followUpController');
const { uploadAttachment, deleteAttachment } = require('../controllers/attachmentController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload, enforceSizeForType } = require('../middleware/upload');

const router = express.Router();

router.use(requireAuth);

router.get('/', listTickets);
router.get('/:id', getTicket);
router.post('/', createTicket);
router.put('/:id', updateTicket);
router.delete('/:id', requireAdmin, deleteTicket);

router.post('/:id/followups', addFollowUp);

router.post('/:id/attachments', upload.single('file'), enforceSizeForType, uploadAttachment);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

module.exports = router;
