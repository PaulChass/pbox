const express = require('express');

const { downloadFile } = require('../controllers/fileController');

const router = express.Router();

// Download a file
router.get('/download/:fileId', downloadFile);

module.exports = router;

