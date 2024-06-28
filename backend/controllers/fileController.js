const File = require('../models/File');
const path = require('path');

// Fetch files in a folder

exports.downloadFile = async (req, res) => {
    const fileId = req.params.fileId;   
    const file = await File.findOne({ where: { id: fileId } });
    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }
    const filePath = path.join(__dirname, '..', 'uploads', file.name);
    console.log(filePath);
    res.download(filePath);   
}
