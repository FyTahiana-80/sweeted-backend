const pool = require('../config/db');

class Bookmark {
    static async add(userId, postId) {
        const [rows] = await pool.query(
            'INSERT INTO enregistrer (id_user, id_post) VALUES (?, ?)',
            [userId, postId]
        );
        return rows;
    }

    static async remove(userId, postId) {
        const [rows] = await pool.query(
            'DELETE FROM enregistrer WHERE id_user = ? AND id_post = ?',
            [userId, postId]
        );
        return rows;
    }

    static async findByUser(userId) {
        const [rows] = await pool.query(
            `SELECT Posts.*,
                    Users.matricule_number,
                    Users.display_name,
                    Users.avatar_url,
                    (SELECT COUNT(*) FROM Sweets WHERE Sweets.id_post = Posts.id) AS total_reactions,
                    (SELECT COUNT(*) > 0 FROM Sweets WHERE Sweets.id_post = Posts.id AND Sweets.id_user = ?) AS has_reacted,
                    (SELECT COUNT(*) > 0 FROM enregistrer WHERE enregistrer.id_post = Posts.id AND enregistrer.id_user = ?) AS is_bookmarked
             FROM enregistrer
             JOIN Posts ON enregistrer.id_post = Posts.id
             JOIN Users ON Posts.id_user = Users.id
             WHERE enregistrer.id_user = ?
             ORDER BY enregistrer.created_at DESC`,
            [userId, userId, userId]
        );
        return rows;
    }

    static async exists(userId, postId) {
        const [rows] = await pool.query(
            'SELECT 1 FROM enregistrer WHERE id_user = ? AND id_post = ?',
            [userId, postId]
        );
        return rows.length > 0;
    }
}

module.exports = Bookmark;