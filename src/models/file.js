const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

class File {
    static async createMultipart(userId, { originalname, mimetype, size, path: filePath }) {
        const type = mimetype.startsWith('image/') ? 'image' : 'file';
        const [rows] = await pool.query(
            `INSERT INTO \`file\` (type, name, path, size, visibility, id_user, download_count)
             VALUES (?, ?, ?, ?, 'prive', ?, 0)`,
            [type, originalname, filePath, size, userId]
        );
        return rows.insertId;
    }

    static async createCode(userId, { name, content, language }) {
        const [rows] = await pool.query(
            `INSERT INTO \`file\` (type, name, content, language, size, visibility, id_user, download_count)
             VALUES ('code', ?, ?, ?, ?, 'prive', ?, 0)`,
            [name, content, language, Buffer.byteLength(content, 'utf8'), userId]
        );
        return rows.insertId;
    }

    static async createPostAttachment(userId, { originalname, mimetype, size, path: filePath, postId }) {
        const type = mimetype.startsWith('image/') ? 'image' : 'file';
        const [rows] = await pool.query(
            `INSERT INTO \`file\` (type, name, path, size, visibility, id_user, download_count, id_post)
             VALUES (?, ?, ?, ?, 'prive', ?, 0, ?)`,
            [type, originalname, filePath, size, userId, postId]
        );
        return rows.insertId;
    }

    static async deleteByPost(postId) {
        const [files] = await pool.query('SELECT * FROM \`file\` WHERE id_post = ?', [postId]);
        for (const file of files) {
            if (file.path) {
                const fullPath = path.join(__dirname, '..', '..', file.path);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            }
        }
        const [rows] = await pool.query('DELETE FROM \`file\` WHERE id_post = ?', [postId]);
        return rows;
    }

    static async findByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT \`file\`.id, \`file\`.type, \`file\`.name, \`file\`.path, \`file\`.content, \`file\`.language, \`file\`.size,
                    \`file\`.visibility, \`file\`.download_count, \`file\`.created_at, \`file\`.updated_at,
                    \`file\`.id_user, \`file\`.id_post, \`file\`.id_official_post,
                    Users.display_name, Users.avatar_url
             FROM \`file\`
             JOIN Users ON \`file\`.id_user = Users.id
             WHERE \`file\`.id_user = ?
             ORDER BY \`file\`.created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async findPublic() {
        const [rows] = await pool.query(
            `SELECT \`file\`.id, \`file\`.type, \`file\`.name, \`file\`.path, \`file\`.content, \`file\`.language, \`file\`.size,
                    \`file\`.visibility, \`file\`.download_count, \`file\`.created_at, \`file\`.updated_at,
                    \`file\`.id_user, \`file\`.id_post, \`file\`.id_official_post,
                    Users.display_name, Users.avatar_url
             FROM \`file\`
             JOIN Users ON \`file\`.id_user = Users.id
             WHERE \`file\`.visibility = 'public'
             ORDER BY \`file\`.created_at DESC`
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT \`file\`.*, Users.display_name, Users.avatar_url
             FROM \`file\`
             JOIN Users ON \`file\`.id_user = Users.id
             WHERE \`file\`.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async update(id, userId, { name, content, visibility }) {
        const updates = [];
        const params = [];
        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (content !== undefined) {
            updates.push('content = ?');
            params.push(content);
            updates.push('size = ?');
            params.push(Buffer.byteLength(content, 'utf8'));
        }
        if (visibility !== undefined) {
            updates.push('visibility = ?');
            params.push(visibility);
        }
        if (updates.length === 0) return { affectedRows: 0 };
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id, userId);
        const [rows] = await pool.query(
            `UPDATE \`file\` SET ${updates.join(', ')} WHERE id = ? AND id_user = ?`,
            params
        );
        return rows;
    }

    static async delete(id, userId) {
        const file = await this.findById(id);
        if (!file || file.id_user !== userId) return { affectedRows: 0, file: null };
        if (file.path) {
            const fullPath = path.join(__dirname, '..', '..', file.path);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
        const [rows] = await pool.query('DELETE FROM \`file\` WHERE id = ? AND id_user = ?', [id, userId]);
        return { affectedRows: rows.affectedRows, file };
    }

    static async incrementDownload(id) {
        const [rows] = await pool.query(
            'UPDATE \`file\` SET download_count = download_count + 1 WHERE id = ?',
            [id]
        );
        return rows;
    }

    static async canAccess(file, userId) {
        if (!file) return false;
        if (file.id_user === userId) return true;
        if (file.visibility === 'public') return true;
        // Fichier attaché à un post visible : post public (id_post) ou officiel (id_official_post)
        if (file.id_post) {
            const [post] = await pool.query('SELECT 1 FROM Posts WHERE id = ?', [file.id_post]);
            if (post.length) return true;
        }
        if (file.id_official_post) {
            const [official] = await pool.query('SELECT 1 FROM Officiel WHERE id = ?', [file.id_official_post]);
            if (official.length) return true;
        }
        return false;
    }
}

module.exports = File;