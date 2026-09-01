const pool = require('../config/db');

const verifierPermission = (nomPermission) => {
    return async (req, res, next) => {
        try{
            // Vérifier que le `req.user` est bien défini (doit provenir du middleware d'authentification)
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: "Authentification requise." });
            }

            const userId = req.user.id;

            // Pour récupérer le rôle de l'utilisateur
            const [user] = await pool.query(
                'SELECT id_role FROM Users WHERE id = ?',
                [userId]
            );

            if (!user[0]){
                return res.status(401).json({ message: "Compte utilisateur introuvable." });
            }

            const roleId = user[0].id_role;

            // Vérifier si le rôle a la permission
            const [permission] = await pool.query(`
                SELECT Permissions.nom FROM Permissions
                JOIN Permission_de_role ON Permissions.id = Permission_de_role.id_permission
                WHERE Permission_de_role.id_role = ? AND Permissions.nom = ?
            `, [roleId, nomPermission]);

            if (!permission[0]){
                return res.status(403).json({ message: "Permission refusée." });
            }

            next();
        }catch (error){
            res.status(500).json({ message: "Erreur lors de la vérification des permissions.", error });
        }
    };
};

module.exports = verifierPermission