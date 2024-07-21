const express = require('express');
/**
 * Importing fileController functions for file operations.
 * @module routes/files
 */
const { downloadFile, deleteFile, renameFile, moveFile, getFile } = require('../controllers/fileController');
const authenticateOrIsSharedDrive = require('../middleware/authenthicateOrIsSharedDrive');
const authenticate = require('../middleware/auth');
const router = express.Router();


// Download a file
router.get('/download/:fileId/:token?' , authenticateOrIsSharedDrive, downloadFile);

// Delete a file
router.delete('/:fileId/delete',authenticate, deleteFile);

// Rename a file
router.patch('/:fileId/rename', authenticate,renameFile);

// Move a file
router.patch('/:fileId/:newFolderId/move', moveFile);

// Get a file
router.get('/:fileId/:token?', authenticateOrIsSharedDrive,getFile);


module.exports = router;

