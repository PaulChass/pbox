const File = require('../models/File');
const path = require('path');
const fs = require('fs/promises')
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

// Delete file function
exports.deleteFile = async (req, res) => {

    try {
        const fileId = req.params.fileId;
        const file = await File.findOne({ where: { id: fileId } });

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Assuming 'file.path' is available and contains the relative path
        const filePath = path.resolve(file.path); // Adjust based on actual file location

        // Delete the file from the file system
        await fs.unlink(filePath); // Use await with the promise-based fs.unlink

        // Delete the record from the database
        await file.destroy(); // Ensure this is awaited as well

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error in deleteFile function:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.renameFile = async (req, res) => {
    const fileId = req.params.fileId;
    const { name } = req.body;

    try {
        const file = await File.findByPk(fileId);
        if (!file) {
            return res.status(404).send('File not found');
        }

        const oldPath = file.path;
        const newPath = path.join(__dirname, '..', 'uploads', name);
        console.log('oldPath:', oldPath);
        console.log('newPath:', newPath);
        await fs.rename(oldPath, newPath);
        file.name = name;
        file.path = newPath;
        await file.save();

        res.send('File renamed successfully');
    } catch (error) {
        console.error('Error renaming file:', error);
        res.status(500).send('Error renaming file');
    }
};

