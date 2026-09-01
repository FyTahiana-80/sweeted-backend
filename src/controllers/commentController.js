const Comment = require('../models/comment');
const xss = require('xss');

exports.createComment = async (req, res) => {
    try{
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content?.trim()) {
            return res.status(400).json({ message: "Le commentaire ne peut pas être vide." });
        }
        if (content.length > 1000) {
            return res.status(400).json({ message: "Le commentaire ne peut pas dépasser 1000 caractères." });
        }
        const sanitizedContent = xss(content.trim());
        await Comment.create(userId, postId, sanitizedContent);
        res.status(201).json({ message: "Commentaire ajouté avec succès !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout du commentaire.", error });
    }
};

exports.getCommentsByPostId = async (req, res) => {
    try{
        const postId = req.params.postId;
        const comments = await Comment.findByPostId(postId);
        res.status(200).json(comments);
    }catch (error){
        res.status(500).json({ message: "Erreur lors de la récupération des commentaires.", error });
    }
};