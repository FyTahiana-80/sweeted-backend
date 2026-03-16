const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { body, validationResult } = require('express-validator');


// Format personalisé pour matricule
const validateMatricule = (value) => {
    const regex = /^([0-9]{1,2})-([1-9][0-9]{4})\/25$/;
    if (!regex.test(value)){
        throw new Error("Le matricule doit être au format XX-XXXXX/25 (ex: 5-40014/25).");
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
            const hashedPassword = await bcrypt.hash(password, 10);

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
        if (!user){
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid){
            return res.status(401).json({ message: "Mot de passe incorrect." });
        }

        // générer un Json Web Token
        const token = jwt.sign(
            { matricule_number: user.matricule_number },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, message: "Connexion réussit !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la connexion.", error });
    }
};
