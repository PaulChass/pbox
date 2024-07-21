const File = require('../models/File');
const path = require('path');
const fs = require('fs')
const { ValidationError, DatabaseError } = require('sequelize');
const mime = require('mime-types');


exports.downloadFile = async (req, res) => {
     const fileId = req.params.fileId;
    const file = await File.findOne({ where: { id: fileId } });
    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }
    const filePath = path.join(__dirname, '..', 'uploads', file.folder_id.toString(), file.name);

    try {
        const stats = await fs.promises.stat(filePath);
        const fileSize = stats.size;
        let bytesSent = 0;

        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `filename=${file.name}`,
        });

        const readStream = fs.createReadStream(filePath);
        readStream.on('data', (chunk) => {
            bytesSent += chunk.length;
            console.log(`Sent ${bytesSent} of ${fileSize} bytes (${((bytesSent / fileSize) * 100).toFixed(2)}%)`);
        });
        readStream.pipe(res);

        readStream.on('end', () => {
            res.end();
            console.log('Download completed.');
        });
    } catch (err) {
        console.error("Error during download: ", err);
        res.status(500).json({ error: 'Error during file download' });
    }
};

// Delete file by Id
exports.deleteFile = async (req, res) => {

    try {
        const fileId = req.params.fileId;
        const file = await File.findOne({ where: { id: fileId } });

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Assuming 'file.path' is available and contains the relative path
        const filePath = path.resolve(file.path); // Adjust based on actual file location
        console.log('file path is ',filePath);
        // Delete the file from the file system
        await fs.promises.unlink(filePath); // Use await with the promise-based fs.unlink

        // Delete the record from the database
        await file.destroy(); // Ensure this is awaited as well

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error in deleteFile function:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Rename file by Id (post body should contain the new 'name' field)
exports.renameFile = async (req, res) => {
    const fileId = req.params.fileId;
    const { name } = req.body;

    try {
        const file = await File.findByPk(fileId);
        if (!file) {
            return res.status(404).send('File not found');
        }

        const oldPath = file.path;
        const newPath = path.join(__dirname, '..', 'uploads',file.folder_id.toString(), name);
        await fs.promises.rename(oldPath, newPath);
        file.name = name;
        file.path = newPath;
        await file.save();

        res.send('File renamed successfully');
    } catch (error) {
        console.error('Error renaming file:', error);
        res.status(500).send('Error renaming file');
    }
};

// Move file to a different folder by Id and new folder Id
exports.moveFile = async (req, res) => {    
    const fileId = req.params.fileId;
    const  folderId  = req.params.newFolderId;
    console.log(fileId, folderId );
    try {
        const file = await File.findByPk(fileId);
        if (!file) {
            return res.status(404).send('File not found');
        }

        const oldPath = file.path;
        const newFolderPath = path.join(__dirname, '..', 'uploads', folderId.toString()); // Get the directory part of newPath
        if (!fs.existsSync(newFolderPath)) {
            fs.mkdirSync(newFolderPath);
        }
        const newPath = path.join(__dirname, '..', 'uploads', folderId.toString(), file.name);
        await fs.promises.rename(oldPath, newPath);

        file.folder_id = folderId;
        
        
        file.path = newPath;
        await file.save();
        res.send('File moved successfully');

    } catch (error) {
        console.error('Error moving file:', error);
        res.status(500).send('Error moving file');
    }
}

// Find file by Id and send download progress
exports.getFile = async (req, res) => {
    const { fileId } = req.params;
    try {
        const file = await File.findOne({ where: { id: fileId } });
        if (!file) {
            return res.status(404).send('File not found');
        }
        const filePath = path.join(__dirname, '..', 'uploads', file.folder_id.toString(), file.name);

        const stats = await fs.promises.stat(filePath);
        const fileSize = stats.size;
        let bytesSent = 0;
        const mimeType = mime.lookup(filePath);
                res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': mimeType, // Use the dynamically determined MIME type
            'Content-Disposition': file.name
        });
        const readStream = fs.createReadStream(filePath);
        readStream.on('data', (chunk) => {
            bytesSent += chunk.length;
            console.log(`Sent ${bytesSent} of ${fileSize} bytes (${((bytesSent / fileSize) * 100).toFixed(2)}%)`);
            // Optionally, you could use a mechanism like WebSockets to send this progress to the frontend
        });
        readStream.pipe(res);

        readStream.on('end', () => {
            res.end();
            console.log('Download completed.');
        });
    } catch (error) {
        console.error('Error getting file:', error);
        if (error instanceof ValidationError) {
            return res.status(400).send('Validation error');
        } else if (error instanceof DatabaseError) {
            return res.status(500).send('Database error');
        } else {
            res.status(500).send('Server error');
        }
    }
};

exports.getVideo = async (req, res) => {
    const  fileId  = req.params.fileId;

    const filePath = await resolveFilePath(fileId);
    const fileName = path.basename(filePath);
    if (!filePath) {
        return res.status(404).send('File not found');
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const contentType = mime.lookup(filePath);
    const baseHead = {
        'Content-Disposition': `filename=${fileName}`,
        'Content-Type': contentType,
    };

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
        const chunksize = (end-start)+1;
        const file = fs.createReadStream(filePath, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            ...baseHead,
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            ...baseHead,
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
};

const resolveFilePath = async (fileId) => {
    const file = await File.findOne({ where: { id: fileId } });
    if (!file) {
        return res.status(404).send('File not found');
    }
    const filePath = path.join(__dirname, '..', 'uploads', file.folder_id.toString(), file.name);

    // For example, mapping fileId to a filename or querying a database
    // This is a placeholder function
    return filePath;
}