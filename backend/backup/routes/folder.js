const express = require('express');
const { getFolders, createFolder, uploadFiles, fetchFiles, downloadFolder, deleteFolder, renameFolder } = require('../controllers/folderController');
const router = express.Router();
const  authenticate  = require('../middleware/auth');


// Fetch folder structure
router.get('/:parent_id?', authenticate , getFolders);


// Create a new folder
router.post('/', authenticate , createFolder);

//Upload files
router.post('/:folderId/upload' , uploadFiles);


// Fetch files in a folder
router.get('/:folderId/files', fetchFiles);

// Download folder
router.get('/:folderId/download', downloadFolder);

router.delete('/:folderId/delete', deleteFolder);

router.patch('/:folderId/rename', renameFolder);


module.exports = router;