const pool = require('../config/db');

class User{
    static async create(matricule_number, password, id_role = 3){
        const [rows] = await pool.query(
            'INSERT INTO users (matricule_number, password, id_role) VALUES (?, ?, ?)',
            [matricule_number, password, id_role]
        );
        return rows;
    }

    static async findByMatricule(matricule_number){
        const [rows] = await pool.query(
            //'SELECT * FROM users WHERE matricule_number = ?', => role: int
            'SELECT users.*, roles.nom FROM users LEFT JOIN roles ON users.id_role = roles.id WHERE matricule_number = ?',
            [matricule_number]
            //ici, role: String = "Admin", "Moderateur" ou "Utilisateur"
        );
        return rows[0];
    }
}
/*

mis à jour  de la mise à jour 

*/

module.exports = User;
