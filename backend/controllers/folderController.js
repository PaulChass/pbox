const Folder = require('../models/Folder');
const User = require('../models/User');
const File = require('../models/File');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { calculateFolderSize, sanitizeFolderName, addFolderToArchive, deleteRecursively } = require('../utils/utils');
const  handleError  = require('../utils/handleError');
const { fstat } = require('fs');
// Utility function to find a folder by ID
const findFolderById = async (folderId) => {
  return await Folder.findByPk(folderId);
};

// Fetch all folders for a specific user
exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Folder, as: 'subfolders' }]
    });
    res.json({ success: true, data: folders });
  } catch (error) {
    handleError(res, error, 'Failed to fetch folders');
  }
};

// Create a new folder
exports.createFolder = async (req, res) => {
  const { name, parent_id, email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    const userFolders = await Folder.findAll({ where: { parent_id, user_id: user.id } });
    const folderNames = userFolders.map(folder => folder.name);
    let uniqueFolderName = name;
    let it = 1;

    while (folderNames.includes(uniqueFolderName)) {
      uniqueFolderName = `${name}(${it})`;
      it++;
    }

    const newFolder = await Folder.create({ name: uniqueFolderName, parent_id, user_id: user.id });
    res.status(201).json({ success: true, data: newFolder });
  } catch (error) {
    handleError(res, error, 'Failed to create folder');
  }
};

// Fetch files for a specific folder
exports.fetchFiles = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const files = await File.findAll({ where: { folder_id: folderId } });
    res.json({ success: true, data: files });
  } catch (error) {
    handleError(res, error, 'Failed to fetch files');
  }
};

// Download folder as a zip archive
exports.downloadFolder = async (req, res) => {
  const folderId = req.params.folderId;
  try {
    const folder = await Folder.findByPk(folderId);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const sanitizedFolderName = sanitizeFolderName(folder.name);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level
    });

    // Set headers
    res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFolderName}.zip`);
    res.setHeader('Content-Type', 'application/zip');

    // Pipe the archive data to the response
    archive.pipe(res);

    // Add folder to archive
    const folderPath = path.join(__dirname, '..', 'uploads', folderId);
    await addFolderToArchive(archive, folder, folderPath, sanitizedFolderName);

    // Finalize the archive (this will trigger the 'end' event)
    await archive.finalize();

    // Listen for the 'end' event to set the correct Content-Length
    archive.on('end', () => {
      res.setHeader('Content-Length', archive.pointer());
    });

    // Handle errors
    archive.on('error', (err) => {
      throw err;
    });

  } catch (error) {
    console.error('Failed to download folder:', error);
    res.status(500).json({ error: 'Failed to download folder' });
  }
};
// Delete folder recursively
exports.deleteFolder = async (req, res) => {
  const folderId = req.params.folderId;
  try {
    await deleteRecursively(folderId);
    res.status(200).json({ success: true, message: 'Folder deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Failed to delete folder');
  }
};

// Rename folder
exports.renameFolder = async (req, res) => {
  const folderId = req.params.folderId;
  const { name } = req.body;
  try {
    const folder = await findFolderById(folderId);
    if (!folder) return res.status(404).json({ success: false, error: 'Folder not found' });
    folder.name = name;
    await folder.save();
    res.status(200).json({ success: true, message: 'Folder renamed successfully' });
  } catch (error) {
    handleError(res, error, 'Failed to rename folder');
  }
};

// Move folder
exports.moveFolder = async (req, res) => {
  const folderId = req.params.folderId;
  const newParentId = req.params.newFolderId || null;
  try {
    const folder = await findFolderById(folderId);
    if (!folder) return res.status(404).json({ success: false, error: 'Folder not found' });
    folder.parent_id = newParentId;
    await folder.save();
    res.status(200).json({ success: true, message: 'Folder moved successfully' });
  } catch (error) {
    handleError(res, error, 'Failed to move folder');
  }
};