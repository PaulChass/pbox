const express = require('express');
const { getFolders, createFolder, uploadFiles, fetchFiles } = require('../controllers/folderController');
const router = express.Router();
const  authenticate  = require('../middleware/auth');


// Fetch folder structure
router.get('/:parent_id?', authenticate , getFolders);


// Create a new folder
router.post('/', authenticate , createFolder);

//Upload files
router.post('/:folderId/upload', authenticate , uploadFiles);


// Fetch files in a folder
router.get('/:folderId/files', fetchFiles);

module.exports = router;