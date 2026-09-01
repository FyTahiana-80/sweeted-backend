const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/:userId', authMiddleware, socialController.followUser);
router.delete('/:userId', authMiddleware, socialController.unfollowUser);

module.exports = router;