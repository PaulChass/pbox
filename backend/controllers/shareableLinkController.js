const ShareableLink = require('../models/ShareableLink');
const crypto = require('crypto');
const archiver = require('archiver');
const Folder = require('../models/Folder');
const User = require('../models/User');
const File = require('../models/File');
const fs = require('fs');
const path = require('path');
const multer = require('multer');



// Configure multer for file storage
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads');

        // Ensure the folder exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath); // Use the created directory
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`);
    }
});

const upload = multer({ storage });

exports.uploadFiles = async (req, res) => {
    const token = req.params.token;

    //const userId = req.user.id; // Assuming user ID is available in req.user
    upload.array('files')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(500).json({ error: 'Failed to upload files' });
        } else if (err) {
            console.error('Unknown error during upload:', err);
            return res.status(500).json({ error: 'Failed to upload files' });
        }

        let userId =null ;
        if(req.user !== undefined){
            userId= req.user.id
        }
        try {
            const files = req.files.map(file => ({
                name: file.originalname,
                path: file.path,
                size: file.size,
                folder_id: req.body.folderId,
                user_id: userId
            }));

            await File.bulkCreate(files);

            res.status(200).json({ message: 'Files uploaded and saved successfully' });
        } catch (dbError) {
            console.error('Failed to save files in the database:', dbError);
            res.status(500).json({ error: 'Failed to save files in the database' });
        }
    });
}

// Create a new folder
exports.createFolder = async (req, res) => {
    const { name, parent_id, email } = req.body;
    const user = await User.findOne({ where: { email } });
    let userId =null ;
        if(req.user !== undefined){
            userId= req.user.id
        }
    
    try {
        const newFolder = await Folder.create({
            name,
            parent_id,
            user_id: user.dataValues.id
        });
        res.status(201).json(newFolder);
       

    } catch (error) {
        console.error('Failed to create folder:', error.message);
        res.status(500).json({ error: 'Failed to create folder' });
    }
    
};

exports.downloadFolder = async (req, res) => {
    try {
        const folderId = req.params.folderId;
        const folder = await Folder.findByPk(folderId);

        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const archive = archiver('zip', {
            zlib: { level: 9 } // Compression level
        });

        res.attachment(`${folder.name}.zip`);

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(res);

        const folderPath = path.join(__dirname, '..', 'uploads', folderId.toString());
        console.log(`Starting to add folder to archive: ${folderPath}`);
        await addFolderToArchive(archive, folder, folderPath, folder.name, req.user.id);

        await archive.finalize();
    } catch (error) {
        console.error('Failed to download folder:', error);
        res.status(500).json({ error: 'Failed to download folder' });
    }
};
