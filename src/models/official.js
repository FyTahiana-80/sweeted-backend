const pool = require('../config/db');

class Officiel {
    static async create(userId, content, imageUrl = null) {
        const [rows] = await pool.query(
            'INSERT INTO Officiel (id_user, content, image_url) VALUES (?, ?, ?)',
            [userId, content, imageUrl]
        );
        return rows;
    }

    static async findAll() {
        const [rows] = await pool.query(
            `SELECT Officiel.id, Officiel.content, Officiel.image_url, Officiel.is_pinned,
                    Officiel.created_at, Officiel.id_user,
                    Users.matricule_number,
                    Users.display_name,
                    Users.avatar_url
             FROM Officiel
             JOIN Users ON Officiel.id_user = Users.id
             ORDER BY Officiel.is_pinned DESC, Officiel.created_at DESC`
        );
        const [files] = await pool.query(
            'SELECT id, name, size, type, visibility, download_count, path, id_official_post FROM `file` WHERE id_official_post IS NOT NULL ORDER BY name'
        );
        const filesByOfficial = {};
        for (const f of files) {
            if (!filesByOfficial[f.id_official_post]) filesByOfficial[f.id_official_post] = [];
            filesByOfficial[f.id_official_post].push(f);
        }
        return rows.map(official => ({ ...official, files: filesByOfficial[official.id] || [] }));
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT Officiel.id, Officiel.content, Officiel.image_url, Officiel.is_pinned,
                    Officiel.created_at, Officiel.id_user,
                    Users.matricule_number,
                    Users.display_name,
                    Users.avatar_url
             FROM Officiel
             JOIN Users ON Officiel.id_user = Users.id
             WHERE Officiel.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async update(id, content, isPinned) {
        const [rows] = await pool.query(
            'UPDATE Officiel SET content = ?, is_pinned = ? WHERE id = ?',
            [content, isPinned, id]
        );
        return rows;
    }

    static async delete(id) {
        const [rows] = await pool.query('DELETE FROM Officiel WHERE id = ?', [id]);
        return rows;
    }
}

module.exports = Officiel;