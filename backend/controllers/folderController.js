const  Folder  = require('../models/Folder');
const User = require('../models/User');
const File = require('../models/File');
const archiver = require('archiver');

const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Fetch folder structure for a specific user
exports.getFolders = async (req, res) => {
    try {
        const folders = await Folder.findAll({
            where: { user_id: req.user.id },
            include: [
                {
                    model: Folder,
                    as: 'subfolders'  // Assuming this is correctly defined in your model
                }
            ]
        });
        res.json(folders);
    } catch (error) {
        console.log(Folder);
        console.error('Failed to fetch folders:', error.message);
        res.statuus(500).json({ error: 'Failed to fetch folders' });
    }
};

// Create a new folder
exports.createFolder = async (req, res) => {
    const { name, parent_id, email } = req.body;
    const user = await User.findOne({ where: { email } });
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

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderId = req.params.folderId; // Get folderId from request params
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

exports.uploadFiles = (req, res) => {
  const folderId = req.params.folderId ;
  
  //const userId = req.user.id; // Assuming user ID is available in req.user
  upload.array('files')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(500).json({ error: 'Failed to upload files' });
    } else if (err) {
      console.error('Unknown error during upload:', err);
      return res.status(500).json({ error: 'Failed to upload files' });
    }


    try {
      const files = req.files.map(file => ({
        name: file.originalname,
        path: file.path,
        size: file.size,
        folder_id: folderId,
        user_id: req.user.id
      }));

      await File.bulkCreate(files);

      res.status(200).json({ message: 'Files uploaded and saved successfully' });
    } catch (dbError) {
      console.error('Failed to save files in the database:', dbError);
      res.status(500).json({ error: 'Failed to save files in the database' });
    }
  });
};

  exports.fetchFiles = async (req, res) => {
    try {
        const folderId = req.params.folderId;
             const files = await File.findAll({ where: { folder_id: folderId } }); // Adjust according to your schema
        res.json(files);
    } catch (error) {
        console.error('Failed to fetch files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
  };

  const addFolderToArchive = async (archive, folder, baseFolderPath, baseArchivePath) => {
    console.log(`Adding folder to archive: ${baseFolderPath}`);
    
    // Add files in the current folder to the archive
    const files = await File.findAll({ where: { folder_id: folder.id } });
    for (const file of files) {
        const filePath = path.join(baseFolderPath, file.name);
        console.log(`Checking file path: ${filePath}`);
        if (fs.existsSync(filePath)) {
            const archiveFilePath = path.join(baseArchivePath, file.name);
            console.log(`Adding file to archive: ${filePath} as ${archiveFilePath}`);
            archive.file(filePath, { name: archiveFilePath });
        } else {
            console.log(`File not found: ${filePath}`);
        }
    }

    // Add subfolders recursively to the archive
    const subfolders = await Folder.findAll({ where: { parent_id: folder.id } });
    for (const subfolder of subfolders) {
        const subfolderPath = path.join(baseFolderPath, '..', subfolder.id.toString());
        const subfolderArchivePath = path.join(baseArchivePath, subfolder.name);
        console.log(`Adding subfolder to archive: ${subfolderPath} as ${subfolderArchivePath}`);
        await addFolderToArchive(archive, subfolder, subfolderPath, subfolderArchivePath);
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

      const folderPath = path.join(__dirname, '..', 'uploads');
      console.log(`Starting to add folder to archive: ${folderPath}`);
      await addFolderToArchive(archive, folder, folderPath, folder.name);

      await archive.finalize();
  } catch (error) {
      console.error('Failed to download folder:', error);
      res.status(500).json({ error: 'Failed to download folder' });
  }
};

