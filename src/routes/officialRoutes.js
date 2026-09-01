const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const officialController = require('../controllers/officialController');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/verifierPermission');

// Configuration multer pour l'upload des images officielles
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'official-' + uniqueSuffix + ext);
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
    limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo max
});

// Flux officiel (auth requis)
router.get('/', authMiddleware, officialController.getOfficials);
// Publication officielle : permission publish_official (Admin uniquement)
router.post('/', authMiddleware, permissionMiddleware('publish_official'), upload.single('image'), officialController.createOfficial);
router.put('/:id', authMiddleware, permissionMiddleware('publish_official'), officialController.updateOfficial);
router.delete('/:id', authMiddleware, permissionMiddleware('publish_official'), officialController.deleteOfficial);

// Erreurs multer (filtre type / taille) → réponse JSON propre
router.use((err, req, res, next) => {
    if (err && res.headersSent) {
        return next(err);
    }
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "L'image ne peut pas dépasser 5 Mo." });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err && err.message === 'Seules les images sont acceptées.') {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

module.exports = router;