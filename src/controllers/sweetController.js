const Sweet = require('../models/sweet');

exports.addSweet = async (req, res) => {
    try{
        const { postId } = req.params;
        const userId = req.user.id;
        await Sweet.addSweet(userId, postId);
        res.status(201).json({ message: "Sweet ajouté avec succès !", has_reacted: true });
    }catch(error){
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Vous avez déjà réagi à ce post." });
        }
        res.status(500).json({ message: "Erreur lors de l'ajout du sweet.", error });
    }
};

exports.removeSweet = async (req, res) => {
    try{
        const { postId } = req.params;
        const userId = req.user.id;
        await Sweet.removeSweet(userId, postId);
        res.status(200).json({ message: "Sweet supprimé avec succès !" });
    }catch(error){
        res.status(500).json({ message: "Erreur lors de la suppression du sweet.", error });
    }
};