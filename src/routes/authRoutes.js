const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const authMiddleware = require('../middlewares/authMiddleware');
//Routes

// Pour inscription
router.post('/register', authController.register);

// Pour connexion
router.post('/login', authController.login);



// Route protégé : seulement un utilisateur connecté peut accéder
router.post('/protected-route', authMiddleware, (req, res) => {
    res.json({ message: `Hey, ${req.user.matricule_number} ! Vous êtes autorisé.` });
});

module.exports = router;
