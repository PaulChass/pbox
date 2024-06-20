const express = require('express');
const { getFolders, createFolder } = require('../controllers/folderController');
const router = express.Router();

// Fetch folder structure
router.get('/', getFolders);

// Create a new folder
router.post('/', createFolder);

module.exports = router;