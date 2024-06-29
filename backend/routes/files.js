const express = require('express');
const { downloadFile, deleteFile, renameFile } = require('../controllers/fileController');
const router = express.Router();


// Download a file
router.get('/download/:fileId', downloadFile);

router.delete('/:fileId/delete', deleteFile);

// Rename a file
router.patch('/:fileId/rename', renameFile);

module.exports = router;

