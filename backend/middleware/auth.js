const jwt = require('jsonwebtoken');
const  User = require('../models/User');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.error('No authorization header');
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        console.error('No token in authorization header');
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded JWT:', decoded);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            console.error('User not found for decoded token');
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};


module.exports = authenticate;
