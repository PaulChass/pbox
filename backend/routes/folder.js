const express = require('express');
const { getFolders, createFolder, uploadFiles  } = require('../controllers/folderController');
const router = express.Router();

// Fetch folder structure
router.get('/', getFolders);

// Create a new folder
router.post('/', createFolder);

//Upload files
router.post('/:folderId/upload', uploadFiles);

module.exports = router;