const { get } = require('http');
const File = require('../models/File');
const Folder = require('../models/Folder');
const fs = require('fs');

// Fetch remote files
exports.fetchRemoteFiles = async (req, res) => {
    try {
        const remoteFolder = await Folder.findOne({ where: { name: 'SyncFolder' } });
        if (!remoteFolder) {
            console.log('Remote folder not found');
            return res.status(404).json({ error: 'Remote folder not found' });
        }
        const files = await File.findAll({ where: { folder_id: remoteFolder.id } });
        const subfolders = await getSubfolders(remoteFolder);
        for (const subfolder of subfolders) {
            const subfolderFiles = await File.findAll({ where: { folder_id: subfolder.id } });
            files.push(...subfolderFiles);
        }
        res.json(files);
    } catch (error) {
        console.error('Failed to fetch remote files:', error.message);
        res.status(500).json({ error: 'Failed to fetch remote files' });
    }
};

const getSubfolders = async (folder) => {
    const subfolders = await Folder.findAll({ where: { parent_id: folder.id } });
    const allSubfolders = [...subfolders];

    for (const subfolder of subfolders) {
        const nestedSubfolders = await getSubfolders(subfolder);
        allSubfolders.push(...nestedSubfolders);
    }

    return allSubfolders;
};

exports.fetchRemoteFolders = async (req, res) => {
    try {
        const syncFolder = await Folder.findOne({ where: { name: 'SyncFolder' } });
        if (!syncFolder) {
            console.log('Remote folder not found');
            return res.status(404).json({ error: 'Remote folder not found' });
        }
        const subFolders = await getSubfolders(syncFolder);
        const remoteFolders = [syncFolder, ...subFolders];
        if (remoteFolders.length === 0) {
            console.log('No remote folders found');
        }
        res.json(remoteFolders);
    } catch (error) {
        console.error('Error fetching remote folders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const fileName = req.params.fileName;
        console.log('Try Downloading file:', fileName);
        const file = await File.findOne({ where: { name: fileName } });
        if (!file) {
            console.log('File not found');
            return res.status(404).json({ error: 'File not found' });
        }
        const filePath = file.path;
        res.download(filePath, fileName);
    }
    catch (error) {
        console.error(`Failed to download:`, error.message);
        res.status(500).send(`Failed to download: ${error.message}`);
    }
}

exports.deleteFile = async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const file = await File.findOne({ where: { name: fileName } });

        if (!file) {
            console.log('File not found');
            return res.status(404).json({ error: 'File not found' });
        }
        //remove file from uploads folder
        const filePath = file.path;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        // check if file was the last file in the folder
        const folderId = file.folder_id;
        const files = await File.findAll({ where: { folder_id: folderId } });
        if (files.length === 1) {
            // remove the folder
            const folder = await Folder.findByPk(folderId);
            if (folder) {
                await folder.destroy();
            }
        }
        await file.destroy();
        res.json({ message: 'File deleted successfully' });

    } catch (error) {
        console.error(`Failed to delete:`, error.message);
        res.status(500).send(`Failed to delete: ${error.message}`);
    }
}

exports.getFolderId = async (folderName) => {
    const folder = await Folder.findOne({ where: { name: folderName } });
    if (folder) {
        return folder.id;
    }
    return null;
}

exports.getParentFolderId = async (folderName) => {
    const folder = await Folder.findOne({ where: { name: folderName } });
    console.log('Folder:', folder);
    if (folder) {
        return folder.id;
    }
    return null;
}

exports.getFolderName = async (folderId) => {
    const folder = await Folder.findByPk(folderId);
    if (!folder) {
        return null;
    }
    return folder.name;
}

