const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const authenticate = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = authenticate;
