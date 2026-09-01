const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Vérification des variables d'environnement
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (process.env.DB_PASSWORD === undefined) {
    missingVars.push('DB_PASSWORD');
}
if (missingVars.length > 0) {
    console.error(`X Variables d'environnement manquantes : ${missingVars.join(', ')}`);
    process.exit(1);
}

// Création automatique du dossier uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { message: "Trop de tentatives. Réessayez dans 15 minutes." }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { message: "Trop d'inscriptions. Réessayez dans 1 heure." }
});

//Gestion de post
const postRoutes = require('./routes/postRoute');
const sweetRoutes = require('./routes/sweetRoute');
const commentRoutes = require('./routes/commentRoute');

//Officiel + Notifications
const officialRoutes = require('./routes/officialRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

//Fichiers
const fileRoutes = require('./routes/fileRoutes');

//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Logging diagnostic des requêtes entrantes
app.use((req, res, next) => {
    res.on('finish', () => {
        const bodyPreview = req.method === 'POST' && req.body ? JSON.stringify(req.body).slice(0, 200) : '';
        console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.originalUrl} => ${res.statusCode} ${bodyPreview}`);
    });
    next();
});

// Servir les images uploadées
app.use('/uploads', express.static(uploadDir));

//Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

//Routes pour gestion De Post
app.use('/api/posts', postRoutes);
app.use('/api/sweets', sweetRoutes);
app.use('/api/comments', commentRoutes);

//Routes Officiel + Notifications
app.use('/api/official', officialRoutes);
app.use('/api/notifications', notificationRoutes);

//Routes Fichiers
app.use('/api/files', fileRoutes);

//Routes Social (suivi + enregistrements)
const followRoutes = require('./routes/followRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
app.use('/api/follow', followRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

app.get('/', (req, res) => {
    res.send('BACKEND Heheheee !');
});

//Demarrer serveur
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`server is executing at PORT: ${PORT}, HOST: ${HOST}`);
});
