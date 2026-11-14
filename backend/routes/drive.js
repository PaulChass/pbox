const express = require('express');
const path = require('path');
const fs = require('fs');
const authenticate = require('../middleware/auth');

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Free / total space of the disk that holds the uploads folder.
// GET /api/drive/space -> { free, total, used } in bytes
router.get('/space', authenticate, async (req, res) => {
    if (typeof fs.promises.statfs !== 'function') {
        return res.status(501).json({ error: 'Disk space needs Node >= 18.15' });
    }
    try {
        await fs.promises.mkdir(UPLOADS_DIR, { recursive: true });
        const stats = await fs.promises.statfs(UPLOADS_DIR);
        const total = stats.blocks * stats.bsize;
        const free = stats.bavail * stats.bsize; // space usable by this process
        res.json({ free, total, used: total - stats.bfree * stats.bsize });
    } catch (err) {
        console.error('Error reading disk space:', err);
        res.status(500).json({ error: 'Could not read disk space' });
    }
});

module.exports = router;
