const express = require('express');
const { getFolders, createFolder, uploadFiles } = require('../controllers/folderController');
const router = express.Router();
const  authenticate  = require('../middleware/auth');


// Fetch folder structure
router.get('/:parent_id?', authenticate , getFolders);


// Create a new folder
router.post('/', authenticate , createFolder);

//Upload files
router.post('/:folderId/upload', uploadFiles);

module.exports = router;