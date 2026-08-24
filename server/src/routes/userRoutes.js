const express = require('express');
const { listUsers, createUser, setUserActive } = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id/active', setUserActive);

module.exports = router;
