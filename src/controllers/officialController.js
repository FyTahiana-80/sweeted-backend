const Officiel = require('../models/official');
const Notification = require('../models/notification');
const path = require('path');
const fs = require('fs');
const xss = require('xss');

const EXTRAIT_MAX = 120;

exports.getOfficials = async (req, res) => {
    try {
        const officials = await Officiel.findAll();
        res.status(200).json(officials);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des publications officielles.", error });
    }
};

exports.createOfficial = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content?.trim() && !req.file) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "La publication doit contenir du texte ou une image." });
        }
        if (content && content.length > 2000) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Le contenu ne peut pas dépasser 2000 caractères." });
        }

        const sanitizedContent = content ? xss(content.trim()) : '';

        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const result = await Officiel.create(req.user.id, sanitizedContent, imageUrl);
        const officialId = result.insertId;

        const extrait = sanitizedContent
            ? (sanitizedContent.length > EXTRAIT_MAX ? sanitizedContent.slice(0, EXTRAIT_MAX) + '...' : sanitizedContent)
            : 'Nouvelle publication officielle de la Direction ISPM.';
        await Notification.fanOut('official', extrait, officialId);

        res.status(201).json({ message: "Publication officielle créée !" });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: "Erreur lors de la création de la publication officielle.", error });
    }
};

exports.updateOfficial = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, is_pinned } = req.body;

        const official = await Officiel.findById(id);
        if (!official) {
            return res.status(404).json({ message: "Publication officielle introuvable." });
        }
        if (!content?.trim()) {
            return res.status(400).json({ message: "Le contenu ne peut pas être vide." });
        }
        if (content.length > 2000) {
            return res.status(400).json({ message: "Le contenu ne peut pas dépasser 2000 caractères." });
        }

        await Officiel.update(id, xss(content.trim()), is_pinned ? 1 : 0);
        res.status(200).json({ message: "Publication officielle mise à jour !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la publication officielle.", error });
    }
};

exports.deleteOfficial = async (req, res) => {
    try {
        const { id } = req.params;

        const official = await Officiel.findById(id);
        if (!official) {
            return res.status(404).json({ message: "Publication officielle introuvable." });
        }

        if (official.image_url) {
            const imagePath = path.join(__dirname, '..', '..', official.image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Notification.deleteByOfficialPost(id);
        await Officiel.delete(id);
        res.status(200).json({ message: "Publication officielle supprimée !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la publication officielle.", error });
    }
};