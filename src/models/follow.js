const pool = require('../config/db');

class Follow {
    static async follow(followerId, followedId) {
        const [rows] = await pool.query(
            'INSERT INTO Suivre (id_user_suiveur, id_user_suivi) VALUES (?, ?)',
            [followerId, followedId]
        );
        return rows;
    }

    static async unfollow(followerId, followedId) {
        const [rows] = await pool.query(
            'DELETE FROM Suivre WHERE id_user_suiveur = ? AND id_user_suivi = ?',
            [followerId, followedId]
        );
        return rows;
    }

    static async countFollowers(userId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) AS count FROM Suivre WHERE id_user_suivi = ?',
            [userId]
        );
        return rows[0].count;
    }

    static async countFollowing(userId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) AS count FROM Suivre WHERE id_user_suiveur = ?',
            [userId]
        );
        return rows[0].count;
    }

    static async isFollowing(followerId, followedId) {
        const [rows] = await pool.query(
            'SELECT 1 FROM Suivre WHERE id_user_suiveur = ? AND id_user_suivi = ?',
            [followerId, followedId]
        );
        return rows.length > 0;
    }
}

module.exports = Follow;