const express = require('express');
/**
 * 
 * @module folder
 * @description This module handles the routes for folders.
 * @requires folderController
 * @exports getFolders
 * @exports createFolder
 * @exports fetchFiles
 * @exports downloadFolder
 * @exports deleteFolder
 * @exports renameFolder
 * @exports moveFolder
 */
const { getFolders, createFolder, fetchFiles, downloadFolder, deleteFolder, renameFolder, moveFolder } = require('../controllers/folderController');
const { uploadFiles } = require('../controllers/fileController');
const router = express.Router();
const  authenticate  = require('../middleware/auth');
const authenticateOrIsSharedDrive = require('../middleware/authenthicateOrIsSharedDrive');

// Fetch folder structure
router.get('/:parent_id?', authenticate , getFolders);

// Create a new folder
router.post('/',  createFolder);

//Upload files
router.post('/:folderId/upload', uploadFiles);

// Fetch files in a folder
router.get('/:folderId/files/:token?', authenticateOrIsSharedDrive, fetchFiles);

// Download folder
router.get('/:folderId/download/:token?', authenticateOrIsSharedDrive, downloadFolder);

// Delete folder
router.delete('/:folderId/delete', authenticate,deleteFolder);

// Rename folder
router.patch('/:folderId/rename', renameFolder);

// Move folder
router.patch('/:folderId/:newFolderId?/move', moveFolder);

module.exports = router;