/**
 * Middleware to fetch the shareable link and check its type
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 */
const express = require('express');
const  authenticate  = require('../middleware/auth');
const ShareableLink = require('../models/ShareableLink');


// Middleware to fetch the shareable link and check its type
const checkShareableLinkType = async (req, res, next) => {
    const token = req.params.token;
    try {
        const shareableLink = await ShareableLink.findOne({ where: { token } });

        if (!shareableLink) {
            return res.status(404).json({ error: 'Shareable link not found' });
        }

        // Attach the shareable link to the request object
        req.shareableLink = shareableLink;

          if (shareableLink.type === 'private') {
            // If the link is private, proceed to authenticate middleware
            return authenticate(req, res, next);
        }
        // If the link is public, proceed without authentication
        next();
    } catch (error) {
        console.error('Failed to check shareable link:', error);
        res.status(500).json({ error: 'Failed to check shareable link' });
    }
}

module.exports = checkShareableLinkType;

