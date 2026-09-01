const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Liste + compteur non-lus
router.get('/', authMiddleware, notificationController.getNotifications);
// Marquer tout comme lu (déclarée avant /:id/read pour éviter la capture de 'read-all')
router.put('/read-all', authMiddleware, notificationController.markAllNotificationsRead);
// Marquer une notification comme lue
router.put('/:id/read', authMiddleware, notificationController.markNotificationRead);

module.exports = router;