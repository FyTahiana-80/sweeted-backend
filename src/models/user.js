const pool = require('../config/db');

class User{
    static async create(matricule_number, password, id_role = 3){
        const [rows] = await pool.query(
            'INSERT INTO Users (matricule_number, password, id_role) VALUES (?, ?, ?)',
            [matricule_number, password, id_role]
        );
        return rows;
    }

    static async findByMatricule(matricule_number){
        const [rows] = await pool.query(
            `SELECT Users.id, Users.matricule_number, Users.password, Users.display_name,
                    Users.avatar_url, Users.bio, Users.filiere, Users.id_role, Users.created_at,
                    Roles.nom AS role
             FROM Users LEFT JOIN Roles ON Users.id_role = Roles.id
             WHERE Users.matricule_number = ?`,
            [matricule_number]
        );
        return rows[0];
    }

    static async findById(id){
        const [rows] = await pool.query(
            `SELECT Users.id, Users.matricule_number, Users.display_name, Users.avatar_url, Users.bio, Users.filiere, Users.id_role, Roles.nom AS role
             FROM Users LEFT JOIN Roles ON Users.id_role = Roles.id
             WHERE Users.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async updateProfile(id, { display_name, bio, avatar_url, filiere }){
        const updates = [];
        const params = [];
        if (display_name !== undefined) {
            updates.push('display_name = ?');
            params.push(display_name);
        }
        if (bio !== undefined) {
            updates.push('bio = ?');
            params.push(bio);
        }
        if (avatar_url !== undefined) {
            updates.push('avatar_url = ?');
            params.push(avatar_url);
        }
        if (filiere !== undefined) {
            updates.push('filiere = ?');
            params.push(filiere);
        }
        if (updates.length === 0) return { affectedRows: 0 };
        params.push(id);
        const [rows] = await pool.query(
            `UPDATE Users SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
        return rows;
    }

    static async search(query){
        const [rows] = await pool.query(
            `SELECT Users.id, Users.matricule_number, Users.display_name, Users.avatar_url, Users.bio, Users.filiere
             FROM Users
             WHERE Users.matricule_number LIKE ? OR Users.display_name LIKE ?
             LIMIT 20`,
            [`%${query}%`, `%${query}%`]
        );
        return rows;
    }
}

module.exports = User;
