const pool = require('../config/db');

class Sweet{
    static async addSweet(userId, postId){
        const [rows] = await pool.query(
            'INSERT INTO Sweets (id_user, id_post) VALUES (?, ?)',
            [userId, postId]
        );
        return rows;
    }

    static async removeSweet(userId, postId){
        const [rows] = await pool.query(
            'DELETE FROM Sweets WHERE id_user = ? AND id_post = ?',
            [userId, postId]
        );
        return rows;
    }

    static async countSweets(postId){
        const [rows] = await pool.query(
            'SELECT COUNT(*) AS count FROM Sweets WHERE id_post = ?',
            [postId]
        );
        return rows[0].count;
    }
}

module.exports = Sweet;
