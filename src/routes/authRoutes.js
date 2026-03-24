const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const verifierPermission = require('../middlewares/verifierPermission')
const authMiddleware = require('../middlewares/authMiddleware');
/*Routes*/

//pour verifier si user peut creer des utilisateurs
router.post('/create-user', authMiddleware, verifierPermission('create_user'), authController.createUser);

// Pour inscription
router.post('/register', authController.register);

// Pour connexion
router.post('/login', authController.login);



// Route protégé : seulement un utilisateur connecté peut accéder
router.post('/protected-route', authMiddleware, (req, res) => {
    res.json({ message: `Hey, ${req.user.matricule_number} ! Vous êtes autorisé.` });
});

module.exports = router;
