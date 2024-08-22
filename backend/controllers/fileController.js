const File = require('../models/File');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { ValidationError, DatabaseError } = require('sequelize');
const mime = require('mime-types');
const { ensureFolderStructure } = require('../utils/utils');

// Download file by Id
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
       });
       readStream.pipe(res);

       readStream.on('end', () => {
           res.end();
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
           // Optionally, you could use a mechanism like WebSockets to send this progress to the frontend
       });
       readStream.pipe(res);

       readStream.on('end', () => {
           res.end();
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
// Get video by ID

exports.getVideo = async (req, res) => {
    const  fileId  = req.params.fileId;
    const file = await File.findOne({ where: { id: fileId } });
    const filePath = path.join(__dirname, '..', 'uploads', file.folder_id.toString(), file.name);    
    const fileName = path.basename(filePath);
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
// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderId = req.params.folderId;
        const uploadPath = path.join(__dirname, '..', 'uploads', folderId);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`);
    }
});

const upload = multer({ storage });

// Upload files to a specific folder
exports.uploadFiles = (req, res) => {
    const rootFolderId = req.params.folderId;
    upload.array('files')(req, res, async (err) => {
        if (err) console.error( err, 'Failed to upload files');
        try {
            for (const file of req.files) {
                const folderId = await ensureFolderStructure(file.folderPath || '', rootFolderId);
                let fileName = file.originalname;
                let filePath = path.join(__dirname, '..', 'uploads', folderId.toString(), fileName);
                //get the size of the file
                const size = fs.statSync(filePath).size;
                let it = 1;
                
                //check if the file already exists in the folder
                if (await File.findOne({ where: { name: fileName, folder_id: folderId } })) {
                   console.log('File already exists');
                   return res.status(409).json({ message: 'File already exists' });
                }
                else{await File.create({ name: fileName, path: filePath, folder_id: folderId, size });    }
            }
            res.status(200).json({ message: 'Files uploaded and saved successfully' });
        } catch (error) {
            console.error('Failed to process files', error);
            res.status(500).json({ message: 'Failed to process files' });
        }
    });
};