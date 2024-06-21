const express = require('express');
//const  createShareableLink  = require('../controllers/shareableLinkController');
const router = express.Router();
const  authenticate  = require('../middleware/auth');
const ShareableLink = require('../models/ShareableLink');
const crypto = require('crypto');

// Create shareable link
router.post('/create', authenticate, async (req, res) => {
    const { type, folderId, expiresAt } = req.body;
    try {
      // Generate a unique token for the shareable link
      const token = crypto.randomBytes(20).toString('hex');
      // Create the shareable link in the database
      const link = await ShareableLink.create({
        token,
        type,
        folderId,
        expiresAt,
      });
  
      res.json({ link });
    } catch (error) {
      console.error('Failed to create shareable link:', error);
      res.status(500).json({ error: 'Failed to create shareable link' });
    }
  });
  

module.exports = router;