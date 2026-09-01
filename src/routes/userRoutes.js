const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const socialController = require('../controllers/socialController');
const authMiddleware = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'avatar-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont acceptées.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Recherche d'utilisateurs par matricule ou display_name
router.get('/search', authMiddleware, userController.searchUsers);
// Statistiques d'un utilisateur (abonnés / abonnements / is_following)
router.get('/:id/stats', authMiddleware, socialController.getUserStats);
// Mise à jour du profil
router.put('/me', authMiddleware, upload.single('avatar'), userController.updateProfile);

// Erreurs multer (filtre type / taille) → réponse JSON propre
router.use((err, req, res, next) => {
    if (err && res.headersSent) {
        return next(err);
    }
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "Le fichier ne peut pas dépasser 5 Mo." });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err && err.message === 'Seules les images sont acceptées.') {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

module.exports = router;
