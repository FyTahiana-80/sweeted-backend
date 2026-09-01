const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'file-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images (JPEG, PNG, WebP) et les PDF sont acceptées.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo
});

router.post('/', authMiddleware, upload.single('file'), fileController.uploadFile);
router.get('/', authMiddleware, fileController.getFiles);
router.get('/:id', authMiddleware, fileController.getFileById);
// Exception documentée : le token peut aussi passer en ?token= pour permettre
// l'ouverture du téléchargement dans le navigateur système (WebBrowser)
// qui ne peut pas envoyer d'en-tête Authorization. Route uniquement.
router.get('/:id/download', (req, res, next) => {
    if (!req.headers.authorization && req.query.token) {
        req.headers.authorization = `Bearer ${req.query.token}`;
    }
    next();
}, authMiddleware, fileController.downloadFile);
router.put('/:id', authMiddleware, fileController.updateFile);
router.delete('/:id', authMiddleware, fileController.deleteFile);

// Erreurs multer (filtre type / taille) → réponse JSON propre
router.use((err, req, res, next) => {
    if (err && res.headersSent) {
        return next(err);
    }
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "Le fichier ne peut pas dépasser 10 Mo." });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err && err.message === 'Seules les images (JPEG, PNG, WebP) et les PDF sont acceptées.') {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

module.exports = router;