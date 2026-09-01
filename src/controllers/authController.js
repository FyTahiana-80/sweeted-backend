const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const { body, validationResult } = require('express-validator');


// Format personalisé pour le matricule (flexible pour les années)
const validateMatricule = (value) => {
    const regex = /^([0-9]{1,2})-([1-9][0-9]{4})\/([0-9]{2})$/;
    if (!regex.test(value)){
        throw new Error("Le matricule doit être au format XX-XXXXX/YY (ex: 5-40014/25 ou 37-40014/24).");
    }
    return true;
};

exports.register = [
    // Middleware pour matricule
    body('matricule_number').custom(validateMatricule),
    body('password').isLength({ min: 10 }).withMessage("Le mot de passe doit contenir au moins 10 caractères."),

    // Controleur principal
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { matricule_number, password } = req.body;

            // vérifier si l'utilisateur existe déjà
            const existingUser = await User.findByMatricule(matricule_number);
            if (existingUser){
                return res.status(400).json({ message: "Ce numero matricule est déjà utilisé." });
            }

            // Hacher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 12);

            // Créer l'utilisateur
            await User.create(matricule_number, hashedPassword);

            res.status(201).json({ message: "Utilisateur enregistré avec succès !" });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de l'inscription.", error });
        }
    }
];


exports.login = async (req, res) => {
    try{
        const { matricule_number, password } = req.body;

        // vérifier si l'utilisateur existe
        const user = await User.findByMatricule(matricule_number);
        if (!user) {
            return res.status(401).json({ message: "Identifiants invalides (User)." });
        }

        // vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Identifiants invalides (Password)." });
        }

        // générer un Json Web Token (inclut l'id pour les middlewares de permissions)
        const token = jwt.sign(
            { id: user.id, matricule_number: user.matricule_number, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token,role: user.role, message: "Connexion réussit !" });
    }catch (error){
        res.status(500).json({ message: "Erreur lors de la connexion.", error });
    }
};


exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const postCountResult = await pool.query(
            'SELECT COUNT(*) AS count FROM Posts WHERE id_user = ?',
            [req.user.id]
        );
        const postCount = postCountResult[0][0].count;

        res.status(200).json({ ...user, postCount });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du profil.", error });
    }
};


//Creer un utilisateur (seulement pour les admins)
exports.createUser = async (req, res) => {
    try{
        const{ matricule_number, password, id_role } = req.body;

        // si utilisateur existe
        const existingUser = await User.findByMatricule(matricule_number);

        if (existingUser){
            //mise a jour du role de l'utilisateur (s'il existe)
            await pool.query('UPDATE Users SET id_role = ? WHERE matricule_number = ?', [id_role, matricule_number]);
            return res.status(200).json({ message: "Rôle de l'utilisateur mis à jour avec succès !" });
        }

        //hacher mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        //creer utilisateur, avec le role donné
        await User.create(matricule_number, hashedPassword, id_role);

        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    }catch(error){
        res.status(500).json({ message: "Erreur lors de la création de l'utilisateur.", error });
    }
};
