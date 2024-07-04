const express = require('express');
const { uploadFiles } = require('../controllers/shareableLinkController');
const router = express.Router();
const authenticate = require('../middleware/auth');
const checkShareableLinkType = require('../middleware/checkShareableLinkType');
const ShareableLink = require('../models/ShareableLink');
const crypto = require('crypto');
const Folder = require('../models/Folder');
const File = require('../models/File');


// Create shareable link
router.post('/create',  async (req, res) => {
  const { type, folderId, expiresAt } = req.body;
  try {
    // Generate a unique token for the shareable link
    const token = crypto.randomBytes(20).toString('hex');
    // Create the shareable link in the database
    const link = await ShareableLink.create({
      token,
      type,
      folderId,
      expiresAt,
    });

    res.json({ link });
  } catch (error) {
    console.error('Failed to create shareable link:', error);
    res.status(500).json({ error: 'Failed to create shareable link' });
  }
});

// Route to retrieve folders based on shareable link token
router.get('/:token', checkShareableLinkType, async (req, res) => {
  const token = req.params.token;
  try {
    // Find the shareable link in the database
    const shareableLink = await ShareableLink.findOne({ where: { token } });
    
    console.log(shareableLink.type);
    if (!shareableLink) {
      return res.status(404).json({ error: 'Shareable link not found' });
    }

    // Assuming the link is valid and not expired, retrieve folders associated with folderId
    const folder = await Folder.findOne({ where: { id: shareableLink.folderId } });
    let folders = await Folder.findAll({ where: { parent_id: shareableLink.folderId } });
    let files = await File.findAll({ where: { folder_id: shareableLink.folderId } });


    // Recursive function to get all subfolders and their files
    const getSubfoldersAndFiles = async (parentFolders) => {
      for (const parentFolder of parentFolders) {
          const subfolders = await Folder.findAll({ where: { parent_id: parentFolder.id } });
          const subfolderFiles = await File.findAll({ where: { folder_id: parentFolder.id } });

          folders = folders.concat(subfolders);
          files = files.concat(subfolderFiles);

          if (subfolders.length > 0) {
              await getSubfoldersAndFiles(subfolders);
          }
      }
  };

  await getSubfoldersAndFiles(folders);


    // Send folders data back to the client
    res.json({ folder: folder, type: shareableLink.type, folders: folders, files: files });
  } catch (error) {
    console.error('Failed to retrieve folders:', error);
    res.status(500).json({ error: 'Failed to retrieve folders' });
  }
});

router.post('/:token/upload', uploadFiles);

//router.post('/',checkShareableLinkType, createFolder);



module.exports = router;