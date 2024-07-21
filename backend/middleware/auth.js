const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware function to authenticate requests.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when authentication is successful or rejects with an error.
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.error('No authorization header');
        return next(new Error('No token provided'));
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        console.log('No token provided');
        return next(new Error('No token provided'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded JWT:', decoded);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            console.error('User not found for decoded token');
            return next(new Error('Invalid token'));
        }

        req.user = user;
        next();
    } catch (error) {
        console.log('Failed to authenticate token:', error);
        return next(new Error('Failed to authenticate token'));
    }
};

module.exports = authenticate;