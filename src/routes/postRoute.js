const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const permissionMiddleware = require('../middlewares/verifierPermission');

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'post-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'file') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('La pièce jointe doit être un PDF.'), false);
        }
    } else if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont acceptées.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo (images limitées à 5 Mo dans le contrôleur)
});

router.post('/', authMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), postController.createPost);
// Lecture publique autorisée ; token optionnel pour renvoyer has_reacted
router.get('/', optionalAuthMiddleware, postController.getAllPosts);
router.get('/:id', optionalAuthMiddleware, postController.getPostById);
router.put('/:id', authMiddleware, permissionMiddleware('update_post'), postController.updatePost);
router.delete('/:id', authMiddleware, permissionMiddleware('delete_post'), postController.deletePost);

// Erreurs multer (filtre type / taille) → réponse JSON propre
router.use((err, req, res, next) => {
    if (err && res.headersSent) {
        return next(err);
    }
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "Le fichier ne peut pas dépasser 10 Mo." });
        }
        return res.status(400).json({ message: "Erreur lors de l'upload." });
    }
    if (err && (err.message === 'Seules les images sont acceptées.' || err.message === 'La pièce jointe doit être un PDF.')) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

module.exports = router;
