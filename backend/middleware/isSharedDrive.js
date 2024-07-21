const authenticate = require('./auth');
const ShareableLink = require('../models/ShareableLink');
const Folder = require('../models/Folder');
const File = require('../models/File');

/**
 * Middleware function to check if the user has access to a shared drive.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} folderId - The ID of the folder.
 * @param {string} fileId - The ID of the file.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the middleware is complete.
 */
const isSharedDrive = async (req, res, folderId,fileId, next) => {
    const token = req.params.token;
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const shareableLink = await ShareableLink.findOne({ where: { token } });
        

        // Attach the shareable link to the request object
        req.shareableLink = shareableLink;

        if (shareableLink.type === 'private') {
            // If the link is private, proceed to authenticate middleware
            return authenticate(req, res, next);
        }

        const shareableLinkFolderId = shareableLink.folderId;
        const allowedFolders = [];
        const allowedFiles = [];

        const getAllowedFolders = async (parentFolders) => {
            for (const parentFolder of parentFolders) {
                // Add the parent folder to the list
                allowedFolders.push(parentFolder);

                // Find all subfolders in the parent folder
                const subfolders = await Folder.findAll({ where: { parent_id: parentFolder.id } });
                allowedFolders.push(...subfolders);

                if (subfolders.length > 0) {
                    // Recursively get all subfolders and files
                    await getAllowedFolders(subfolders);
                }
            }
        };


        // Start the recursive function with the root folder
        await getAllowedFolders([{ id: shareableLinkFolderId }]);

        // Map folder IDs correctly
        const allowedFolderIds = allowedFolders.map(folder => folder.id);

        
        getAllowedFiles = async (allowedFoldersIds) => {    
            for (const folderId of allowedFoldersIds) {
                const files = await File.findAll({ where: { folder_id: folderId } });
                allowedFiles.push(...files);
            }
        };

        await getAllowedFiles(allowedFolderIds);
        const allowedFileIds = allowedFiles.map(file => file.id);
        
        // Check if the folderId is in the list of folder IDs
        if (allowedFolderIds.includes(parseInt(folderId))|| allowedFileIds.includes(parseInt(fileId)))
        {
            console.log('User has access to the folder');
            return next();
        } else {
            console.log('Access to the folder is denied');
            return res.status(403).json({ error: 'Access to the folder is denied' });
        }
    } catch (error) {
        return next(error);
    }
};

module.exports = isSharedDrive;