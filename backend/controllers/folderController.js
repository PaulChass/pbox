const  Folder  = require('../models/Folder');
const User = require('../models/User');
const File = require('../models/File');

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
        res.status(500).json({ error: 'Failed to fetch folders' });
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
    cb(null, 'uploads/'); // Define your upload directory
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

exports.uploadFiles = (req, res) => {
  let folderId = req.params.folderId || null;
  if (folderId === 'null') {
    folderId = null;
  }
  //const userId = req.user.id; // Assuming user ID is available in req.user
  console.log(folderId);
console.log(req.user.id);
  upload.array('files')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(500).json({ error: 'Failed to upload files' });
    } else if (err) {
      console.error('Unknown error during upload:', err);
      return res.status(500).json({ error: 'Failed to upload files' });
    }

    console.log(req.files); // Check if req.files is populated correctly

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
        let folderId = req.params.folderId || null;
        if (folderId === 'null') {
          folderId = null;
        }        const files = await File.findAll({ where: { folder_id: folderId } }); // Adjust according to your schema
        console.log(files);
        res.json(files);
    } catch (error) {
        console.error('Failed to fetch files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
  };