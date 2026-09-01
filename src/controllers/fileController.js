const File = require('../models/file');
const path = require('path');
const fs = require('fs');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo pour PDF

exports.uploadFile = async (req, res) => {
    try {
        const userId = req.user.id;
        const isMultipart = req.file !== undefined;

        if (isMultipart) {
            // Upload multipart (PDF/image)
            if (!req.file) {
                return res.status(400).json({ message: 'Aucun fichier fourni.' });
            }
            if (req.file.size > MAX_FILE_SIZE) {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: 'Le fichier ne peut pas dépasser 10 Mo.' });
            }
            const id = await File.createMultipart(userId, {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: `/uploads/${req.file.filename}`
            });
            const file = await File.findById(id);
            return res.status(201).json({ message: 'Fichier uploadé avec succès.', file });
        } else {
            // Upload JSON (fichier code)
            const { name, content, language } = req.body;
            if (!name?.trim()) {
                return res.status(400).json({ message: 'Le nom du fichier est requis.' });
            }
            if (!content?.trim()) {
                return res.status(400).json({ message: 'Le contenu du fichier est requis.' });
            }
            if (!language?.trim()) {
                return res.status(400).json({ message: 'Le langage est requis.' });
            }
            const id = await File.createCode(userId, { name: name.trim(), content, language: language.trim() });
            const file = await File.findById(id);
            return res.status(201).json({ message: 'Fichier code créé avec succès.', file });
        }
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Erreur lors de la création du fichier.', error });
    }
};

exports.getFiles = async (req, res) => {
    try {
        const scope = req.query.scope;
        const userId = req.user.id;
        let files;
        if (scope === 'public') {
            files = await File.findPublic();
        } else {
            files = await File.findByUserId(userId);
        }
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des fichiers.', error });
    }
};

exports.getFileById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({ message: 'Fichier introuvable.' });
        }
        const canAccess = await File.canAccess(file, userId);
        if (!canAccess) {
            return res.status(403).json({ message: 'Accès refusé à ce fichier.' });
        }
        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du fichier.', error });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({ message: 'Fichier introuvable.' });
        }
        const canAccess = await File.canAccess(file, userId);
        if (!canAccess) {
            return res.status(403).json({ message: 'Accès refusé à ce fichier.' });
        }
        await File.incrementDownload(id);
        if (file.path) {
            const fullPath = path.join(__dirname, '..', '..', file.path);
            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({ message: 'Fichier physique introuvable.' });
            }
            res.download(fullPath, file.name);
        } else if (file.type === 'code' && file.content) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
            res.send(file.content);
        } else {
            return res.status(404).json({ message: 'Fichier non téléchargeable.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du téléchargement.', error });
    }
};

exports.updateFile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name, content, visibility } = req.body;
        if (name === undefined && content === undefined && visibility === undefined) {
            return res.status(400).json({ message: 'Aucun champ à mettre à jour.' });
        }
        const result = await File.update(id, userId, { name, content, visibility });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Fichier introuvable ou non autorisé.' });
        }
        const file = await File.findById(id);
        res.status(200).json({ message: 'Fichier mis à jour.', file });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour.', error });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await File.delete(id, userId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Fichier introuvable ou non autorisé.' });
        }
        res.status(200).json({ message: 'Fichier supprimé.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression.', error });
    }
};