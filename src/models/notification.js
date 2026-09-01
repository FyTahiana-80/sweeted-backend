const pool = require('../config/db');

class Notification {
    // Fan-out : une ligne par utilisateur (nation officielle)
    static async fanOut(type, message, officialPostId) {
        const [rows] = await pool.query(
            `INSERT INTO Notification (type, message, id_user, id_official_post)
             SELECT ?, ?, id, ? FROM Users`,
            [type, message, officialPostId]
        );
        return rows;
    }

    static async findByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT Notification.id, Notification.type, Notification.message, Notification.is_read,
                    Notification.created_at, Notification.id_user, Notification.id_official_post,
                    Officiel.content AS official_content,
                    Officiel.image_url AS official_image_url,
                    Officiel.is_pinned AS official_is_pinned,
                    Officiel.created_at AS official_created_at
             FROM Notification
             LEFT JOIN Officiel ON Officiel.id = Notification.id_official_post
             WHERE Notification.id_user = ?
             ORDER BY Notification.created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async countUnread(userId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) AS count FROM Notification WHERE id_user = ? AND is_read = 0',
            [userId]
        );
        return rows[0].count;
    }

    static async markRead(id, userId) {
        const [rows] = await pool.query(
            'UPDATE Notification SET is_read = 1 WHERE id = ? AND id_user = ?',
            [id, userId]
        );
        return rows;
    }

    static async markAllRead(userId) {
        const [rows] = await pool.query(
            'UPDATE Notification SET is_read = 1 WHERE id_user = ? AND is_read = 0',
            [userId]
        );
        return rows;
    }

    static async deleteByOfficialPost(officialPostId) {
        const [rows] = await pool.query(
            'DELETE FROM Notification WHERE id_official_post = ?',
            [officialPostId]
        );
        return rows;
    }
}

module.exports = Notification;