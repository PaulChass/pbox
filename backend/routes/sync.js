const express = require('express');
const {  fetchRemoteFiles, fetchRemoteFolders,downloadFile, deleteFile } = require('../controllers/syncController');
const { uploadFiles } = require('../controllers/fileController');
const { getFolderId, getParentFolderId } = require('../controllers/folderController');
const upload = require('../middleware/uploadMiddleware');
const authenticateServer = require('../middleware/authenticateServer');

const router = express.Router();


// Get remote files
router.get('/get-remote-files',authenticateServer, fetchRemoteFiles );

// Get remote folders
router.get('/get-remote-folders',authenticateServer, fetchRemoteFolders );

// Download a file
router.get('/download/:fileName/',authenticateServer,downloadFile );

// Upload a file
router.post('/upload/:folderId', upload.single('file'), uploadFiles);

// Delete a file
router.delete('/:fileName/delete', deleteFile);

// Get a folderId by name
router.get('/:folderName/id', getFolderId);

module.exports = router;
