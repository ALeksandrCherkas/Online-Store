const jwt = require('jsonwebtoken')

function roleMiddleware(req, res, next) {
    const roleHeader = req.headers.authorization;
    if(!roleHeader){
        return res.status(401).json({message: "Authorization header missing"});
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({message: 'Forbidden'})
    }
    next();
}

module.exports = roleMiddleware;