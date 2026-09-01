const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes: POST /api/comments/:postId, GET /api/comments/:postId
router.post('/:postId', authMiddleware, commentController.createComment);
// Lecture publique des commentaires autorisée (Option A)
router.get('/:postId', commentController.getCommentsByPostId);

module.exports = router;