const express = require('express');
const router = express.Router();
const sweetController = require('../controllers/sweetController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes: POST /api/sweets/:postId, DELETE /api/sweets/:postId
router.post('/:postId', authMiddleware, sweetController.addSweet);
router.delete('/:postId', authMiddleware, sweetController.removeSweet);

module.exports = router;