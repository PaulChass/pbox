const express = require('express');
const { downloadFile, deleteFile, renameFile, moveFile, getFile } = require('../controllers/fileController');
const router = express.Router();


// Download a file
router.get('/download/:fileId', downloadFile);

// Delete a file
router.delete('/:fileId/delete', deleteFile);

// Rename a file
router.patch('/:fileId/rename', renameFile);

// Move a file
router.patch('/:fileId/:newFolderId/move', moveFile);

// Get a file
router.get('/:fileId', getFile);


module.exports = router;

