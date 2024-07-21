const path = require('path');
const fs = require('fs');
const Folder = require('../models/Folder');
const File = require('../models/File');

exports.calculateFolderSize = async (folderId) => {
  const files = await File.findAll({ where: { folder_id: folderId } });
  let totalSize = 0;
  for (const file of files) {
    totalSize += file.size;
  }
  const subfolders = await Folder.findAll({ where: { parent_id: folderId } });
  for (const subfolder of subfolders) {
    totalSize += await exports.calculateFolderSize(subfolder.id);
  }
  return totalSize;
};

exports.sanitizeFolderName = (folderName) => {
  const invalidChars = { '?': '', '<': '', '>': '', ':': '', '"': '', '/': '', '\\': '', '|': '', '*': '' };
  let sanitizedFolderName = folderName;
  for (const [invalidChar, replacement] of Object.entries(invalidChars)) {
    sanitizedFolderName = sanitizedFolderName.split(invalidChar).join(replacement);
  }
  return sanitizedFolderName;
};

exports.addFolderToArchive = async (archive, folder, baseFolderPath, baseArchivePath) => {
  const files = await File.findAll({ where: { folder_id: folder.id } });
  for (const file of files) {
    const filePath = path.join(baseFolderPath, file.name);
    if (fs.existsSync(filePath)) {
      const archiveFilePath = path.join(baseArchivePath, file.name);
      archive.file(filePath, { name: archiveFilePath });
    }
  }
  const subfolders = await Folder.findAll({ where: { parent_id: folder.id } });
  for (const subfolder of subfolders) {
    const subfolderPath = path.join(__dirname, '..', 'uploads', subfolder.id.toString());
    const subfolderArchivePath = path.join(baseArchivePath, subfolder.name);
    await exports.addFolderToArchive(archive, subfolder, subfolderPath, subfolderArchivePath);
  }
};

exports.deleteRecursively = async (folderId) => {
  const files = await File.findAll({ where: { folder_id: folderId } });
  for (const file of files) {
    await fs.promises.unlink(file.path);
    await file.destroy();
  }
  const subfolders = await Folder.findAll({ where: { parent_id: folderId } });
  for (const subfolder of subfolders) {
    await exports.deleteRecursively(subfolder.id);
  }
  const folder = await Folder.findByPk(folderId);
  if (folder) {
    await folder.destroy();
  }
};

exports.ensureFolderStructure = async (folderPath, rootFolderId) => {
  let currentParentId = rootFolderId;
  const pathParts = folderPath.split('/');
  for (const part of pathParts) {
    if (!part) continue;
    let folder = await Folder.findOne({ where: { name: part, parent_id: currentParentId } });
    if (!folder) {
      folder = await Folder.create({ name: part, parent_id: currentParentId });
    }
    currentParentId = folder.id;
  }
  return currentParentId;
};