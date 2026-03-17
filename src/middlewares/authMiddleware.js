const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    //Pour recuperer le token via l'en-tête de la requetea
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token){
        return res.status(401).json({ message: "Accès refusé. Aucun token fournit." });
    }

    try{
        //Pour verifier puis décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); 
    }catch (error){
        res.status(400).json({ message: "Token invalide." });
    }
};
