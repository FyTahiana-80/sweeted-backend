const Follow = require('../models/follow');
const User = require('../models/user');
const Bookmark = require('../models/bookmark');
const Post = require('../models/post');

exports.followUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { userId: targetId } = req.params;

        if (String(userId) === String(targetId)) {
            return res.status(400).json({ message: "Vous ne pouvez pas vous suivre vous-même." });
        }
        const target = await User.findById(targetId);
        if (!target) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }
        if (await Follow.isFollowing(userId, targetId)) {
            return res.status(409).json({ message: "Vous suivez déjà cet utilisateur." });
        }
        await Follow.follow(userId, targetId);
        const followersCount = await Follow.countFollowers(targetId);
        res.status(201).json({ message: "Vous suivez désormais cet utilisateur.", is_following: true, followers_count: followersCount });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'abonnement.", error });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { userId: targetId } = req.params;

        if (String(userId) === String(targetId)) {
            return res.status(400).json({ message: "Vous ne pouvez pas vous suivre vous-même." });
        }
        const target = await User.findById(targetId);
        if (!target) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }
        if (!(await Follow.isFollowing(userId, targetId))) {
            return res.status(404).json({ message: "Vous ne suivez pas cet utilisateur." });
        }
        await Follow.unfollow(userId, targetId);
        const followersCount = await Follow.countFollowers(targetId);
        res.status(200).json({ message: "Vous ne suivez plus cet utilisateur.", is_following: false, followers_count: followersCount });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du désabonnement.", error });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const { id } = req.params;
        const target = await User.findById(id);
        if (!target) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }
        const userId = req.user ? req.user.id : null;
        const [followersCount, followingCount, isFollowing] = await Promise.all([
            Follow.countFollowers(id),
            Follow.countFollowing(id),
            userId ? Follow.isFollowing(userId, id) : false
        ]);
        res.status(200).json({
            user: target,
            followers_count: followersCount,
            following_count: followingCount,
            is_following: isFollowing
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques.", error });
    }
};

exports.addBookmark = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post introuvable." });
        }
        if (await Bookmark.exists(userId, postId)) {
            return res.status(409).json({ message: "Ce post est déjà dans vos enregistrements." });
        }
        await Bookmark.add(userId, postId);
        res.status(201).json({ message: "Post enregistré.", is_bookmarked: true });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Ce post est déjà dans vos enregistrements." });
        }
        res.status(500).json({ message: "Erreur lors de l'enregistrement du post.", error });
    }
};

exports.removeBookmark = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;
        if (!(await Bookmark.exists(userId, postId))) {
            return res.status(404).json({ message: "Ce post n'est pas dans vos enregistrements." });
        }
        await Bookmark.remove(userId, postId);
        res.status(200).json({ message: "Post retiré de vos enregistrements.", is_bookmarked: false });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du retrait du post.", error });
    }
};

exports.getBookmarks = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookmarks = await Bookmark.findByUser(userId);
        res.status(200).json(bookmarks);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des enregistrements.", error });
    }
};