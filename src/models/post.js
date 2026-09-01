const pool = require('../config/db');

class Post{
    static async create(userId, content, imageUrl = null){
        const [rows] = await pool.query(
            'INSERT INTO Posts (id_user, content, image_url) VALUES (?, ?, ?)',
            [userId, content, imageUrl]
        );
        return rows;
    }

    static async findAll(limit = 20, offset = 0, userId = null){
        const userClause = userId
            ? `, (SELECT COUNT(*) > 0 FROM Sweets WHERE Sweets.id_post = Posts.id AND Sweets.id_user = ?) AS has_reacted,
               (SELECT COUNT(*) > 0 FROM enregistrer WHERE enregistrer.id_post = Posts.id AND enregistrer.id_user = ?) AS is_bookmarked`
            : '';
        const params = userId ? [userId, userId, limit, offset] : [limit, offset];
        const [rows] = await pool.query(
            `SELECT Posts.*,
                    Users.matricule_number,
                    Users.display_name,
                    Users.avatar_url,
                    (SELECT COUNT(*) FROM Sweets WHERE Sweets.id_post = Posts.id) AS total_reactions${userClause},
                    (SELECT f.id FROM \`file\` f WHERE f.id_post = Posts.id ORDER BY f.id ASC LIMIT 1) AS file_id,
                    (SELECT f.name FROM \`file\` f WHERE f.id_post = Posts.id ORDER BY f.id ASC LIMIT 1) AS file_name,
                    (SELECT f.type FROM \`file\` f WHERE f.id_post = Posts.id ORDER BY f.id ASC LIMIT 1) AS file_type,
                    (SELECT f.path FROM \`file\` f WHERE f.id_post = Posts.id ORDER BY f.id ASC LIMIT 1) AS file_path
             FROM Posts
             JOIN Users ON Posts.id_user = Users.id
             ORDER BY Posts.created_at DESC
             LIMIT ? OFFSET ?`,
            params
        );
        return rows;
    }

    static async findById(id, userId = null){
        const userClause = userId
            ? `, (SELECT COUNT(*) > 0 FROM Sweets WHERE Sweets.id_post = Posts.id AND Sweets.id_user = ?) AS has_reacted,
               (SELECT COUNT(*) > 0 FROM enregistrer WHERE enregistrer.id_post = Posts.id AND enregistrer.id_user = ?) AS is_bookmarked`
            : '';
        const params = userId ? [userId, userId, id] : [id];
        const [rows] = await pool.query(
            `SELECT Posts.*,
                    Users.matricule_number,
                    Users.display_name,
                    Users.avatar_url,
                    (SELECT COUNT(*) FROM Sweets WHERE Sweets.id_post = Posts.id) AS total_reactions${userClause},
                    (SELECT f.id FROM \`file\` f WHERE f.id_post = Posts.id ORDER BY f.id ASC LIMIT 1) AS file_id,
                    (SELECT f.name FROM \`file\` f WHERE f.id_post = Posts.id ORDER BY f.id ASC LIMIT 1) AS file_name,
                    (SELECT f.type FROM \`file\` f WHERE f.id_post = Posts.id ORDER BY f.id ASC LIMIT 1) AS file_type,
                    (SELECT f.path FROM \`file\` f WHERE f.id_post = Posts.id ORDER BY f.id ASC LIMIT 1) AS file_path
             FROM Posts
             JOIN Users ON Posts.id_user = Users.id
             WHERE Posts.id = ?`,
            params
        );
        return rows[0];
    }

    static async update(id, content){
        const [rows] = await pool.query('UPDATE Posts SET content = ? WHERE id = ?', [content, id]);
        return rows;
    }

    static async delete(id){
        const [rows] = await pool.query('DELETE FROM Posts WHERE id = ?', [id]);
        return rows;
    }
}

module.exports = Post;
