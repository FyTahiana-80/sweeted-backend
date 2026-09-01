const Notification = require('../models/notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findByUserId(req.user.id);
        const unreadCount = await Notification.countUnread(req.user.id);
        res.status(200).json({ notifications, unread_count: unreadCount });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des notifications.", error });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.markRead(id, req.user.id);
        res.status(200).json({ message: "Notification marquée comme lue." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du marquage de la notification.", error });
    }
};

exports.markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.markAllRead(req.user.id);
        res.status(200).json({ message: "Toutes les notifications sont marquées comme lues." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du marquage des notifications.", error });
    }
};