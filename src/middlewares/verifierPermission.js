const pool = require('../config/db');

const verifierPermission = (nomPermission) => {
    return async (req, res, next) => {
        try{
            const userId = req.user.id; // requete, théoriquement, après authentification 

            // Vérifier que le `req.user` est bien défini (doit provenir du middleware d'authentification)
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: "Utilisateur non authentifié." });
            }

            // Pour récupérer le rôle de l'utilisateur
            const [user] = await pool.query(
                'SELECT id_role FROM users WHERE id = ?',
                [userId]
            );

            if (!user[0]){
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }

            const roleId = user[0].id_role;

            // Vérifier si le rôle a la permission
            const [permission] = await pool.query(`
                SELECT permissions.nom FROM permissions
                JOIN permission_de_role ON permissions.id = permission_de_role.id_permission
                WHERE permission_de_role.id_role = ? AND permissions.nom = ?
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