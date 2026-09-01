const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, socialController.getBookmarks);
router.post('/:postId', authMiddleware, socialController.addBookmark);
router.delete('/:postId', authMiddleware, socialController.removeBookmark);

module.exports = router;