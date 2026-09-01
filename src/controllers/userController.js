const User = require('../models/user');
const path = require('path');
const fs = require('fs');

exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return res.status(400).json({ message: "Le paramètre de recherche est requis." });
        }
        const users = await User.search(q.trim());
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la recherche.", error });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { display_name, bio, filiere } = req.body;

        if (display_name !== undefined && display_name.length > 100) {
            return res.status(400).json({ message: "Le nom d'affichage ne peut pas dépasser 100 caractères." });
        }
        if (bio !== undefined && bio.length > 280) {
            return res.status(400).json({ message: "La bio ne peut pas dépasser 280 caractères." });
        }
        if (filiere !== undefined && filiere.length > 100) {
            return res.status(400).json({ message: "La filière ne peut pas dépasser 100 caractères." });
        }
        if (display_name === undefined && bio === undefined && filiere === undefined && !req.file) {
            return res.status(400).json({ message: "Aucun champ à mettre à jour." });
        }

        let avatarUrl;
        if (req.file) {
            avatarUrl = `/uploads/${req.file.filename}`;
            const currentUser = await User.findById(userId);
            if (currentUser && currentUser.avatar_url) {
                const oldPath = path.join(__dirname, '..', '..', currentUser.avatar_url);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        await User.updateProfile(userId, { display_name, bio, avatar_url: avatarUrl, filiere });
        const updated = await User.findById(userId);
        res.status(200).json({ message: "Profil mis à jour avec succès !", user: updated });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Erreur lors de la mise à jour du profil.", error });
    }
};