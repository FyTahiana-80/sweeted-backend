const pool = require('../config/db');

class Comment{
    static async create(userId, postId, content){
        const [rows] = await pool.query(
            'INSERT INTO Comments (id_user, id_post, content) VALUES (?, ?, ?)',
            [userId, postId, content]
        );
        return rows;
    }

    static async findByPostId(postId){
        const [rows] = await pool.query(
            `SELECT Comments.*,
                    Users.matricule_number,
                    Users.display_name,
                    Users.avatar_url
             FROM Comments
             JOIN Users ON Comments.id_user = Users.id
             WHERE Comments.id_post = ?
             ORDER BY Comments.created_at DESC`,
            [postId]
        );
        return rows;
    }
}

module.exports = Comment;
