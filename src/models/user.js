const pool = require('../config/db');

class User{
    static async create(matricule_number, password){
        const [rows] = await pool.query(
            'INSERT INTO users (matricule_number, password) VALUES (?, ?)',
            [matricule_number, password]
        );
        return rows;
    }

    static async findByMatricule(matricule_number){
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE matricule_number = ?',
            [matricule_number]
        );
        return rows[0];
    }
}


module.exports = User;
