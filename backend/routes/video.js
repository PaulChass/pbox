const express = require('express');
const { downloadFile,  getVideo } = require('../controllers/fileController');
const router = express.Router();


//Get a video stream
router.get('/:fileId/stream', getVideo );
// Download video
router.get('/:fileId/downloadVideo', downloadFile);

module.exports = router;
