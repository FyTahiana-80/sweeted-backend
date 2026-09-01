require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');
const [id, matricule_number, role = 'Utilisateur'] = process.argv.slice(2);
const token = jwt.sign({ id: Number(id), matricule_number, role }, process.env.JWT_SECRET, { expiresIn: '2h' });
process.stdout.write(token);