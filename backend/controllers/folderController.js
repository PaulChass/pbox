const  Folder  = require('../models/Folder');
const User = require('../models/User');
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

// Set up multer storage and upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folderId = req.params.folderId;
      const uploadPath = path.join(__dirname, '..', 'uploads', folderId);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Use original filename
    }
  });
  
  const upload = multer({ storage });
  
  // Upload files to a folder
  exports.uploadFiles = (req, res) => {
    // Use `upload.array` or `upload.single` based on your FormData structure
    upload.array('files')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: 'Failed to upload files' });
      } else if (err) {
        console.error('Unknown error during upload:', err);
        return res.status(500).json({ error: 'Failed to upload files' });
      }
  
      console.log(req.files); // Check if req.files is populated correctly
      res.status(200).json({ message: 'Files uploaded successfully' });
    });
  };