const express = require('express');
const { downloadFile, deleteFile, renameFile, moveFile } = require('../controllers/fileController');
const router = express.Router();


// Download a file
router.get('/download/:fileId', downloadFile);

router.delete('/:fileId/delete', deleteFile);

// Rename a file
router.patch('/:fileId/rename', renameFile);

router.patch('/:fileId/:newFolderId/move', moveFile);

module.exports = router;

