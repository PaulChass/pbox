const express = require('express');
const { createShareableLink } = require('../controllers/shareableLinkController');
const router = express.Router();
const checkShareableLinkType = require('../middleware/checkShareableLinkType');
const ShareableLink = require('../models/ShareableLink');
const Folder = require('../models/Folder');
const File = require('../models/File');

// Create shareable link
router.post('/create', createShareableLink);

// Folder routes
router.get('/:token/:parent_id?', checkShareableLinkType, async (req, res) => {
  const token = req.params.token;
  try {
    // Find the shareable link in the database
    const shareableLink = await ShareableLink.findOne({ where: { token } });
    if (!shareableLink) {
      return res.status(404).json({ error: 'Shareable link not found' });
    }

    // Assuming the link is valid and not expired, retrieve folders associated with folderId
    const folder = await Folder.findOne({ where: { id: shareableLink.folderId } });
    let folders = await Folder.findAll({ where: { parent_id: shareableLink.folderId } });
    let files = await File.findAll({ where: { folder_id: shareableLink.folderId } });

    const getSubfoldersAndFiles = async (folders) => {
      for (let i = 0; i < folders.length; i++) {
        const subfolders = await Folder.findAll({ where: { parent_id: folders[i].id } });
        const subfiles = await File.findAll({ where: { folder_id: folders[i].id } });
        folders.push(...subfolders);
        files.push(...subfiles);
        if (subfolders.length > 0) {
          await getSubfoldersAndFiles(subfolders);
        }
      }
      console.log('Folders:', folders); 
    };
    // Recursive function to get all subfolders and their files
    await getSubfoldersAndFiles(folders);
    // Send folders data back to the client
    res.json({ folder: folder, type: shareableLink.type, folders: folders, files: files });
  } catch (error) {
    console.error('Failed to retrieve folders:', error);
    res.status(500).json({ error: 'Failed to retrieve folders' });
  }
});

module.exports = router;