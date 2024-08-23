const { Command } = require('commander');
const axios = require('axios');
const path = require('path');
const config = require('./config');
const { startWatcher } = require('./watcher');
const { downloadFile, uploadFile, createFolder } = require('./fileOperations');
const fs = require('fs');


const program = new Command();

program
  .version('1.0.0')
  .option('-d, --directory <path>', 'Local directory to sync', config.directory)
  .option('-i, --interval <seconds>', 'Polling interval in seconds', config.interval)
  .parse(process.argv);

const options = program.opts();


config.directory = config.localFolder;
console.log('config.directory:', config.localFolder);
config.pollingInterval = options.interval * 1000 * 60 || config.pollingInterval;

console.log(`Syncing directory: ${config.directory}`);
console.log(`Polling interval: ${config.pollingInterval / 1000 / 60} minutes`);

async function fetchRemoteFiles() {
  try {
    console.log('Fetching remote files...');
    const response = await axios.get(`${config.apiBaseUrl}/sync/get-remote-files`, {
      headers: {
        'Authorization': config.authToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch remote files:', error.message);
    throw error;
  }
}

async function fetchRemoteFolders() {
  try {
    const response = await axios.get(`${config.apiBaseUrl}/sync/get-remote-folders`, {
      headers: {
        'Authorization': config.authToken,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch remote folders:', error.message);
    throw error;
  }
}
async function syncFiles() {
  try {
    const remoteFiles = await fetchRemoteFiles();
    const remoteFolders = await fetchRemoteFolders();
    let localElements = fs.readdirSync(config.directory);
    let localSubFolders = localElements.filter(file => fs.statSync(path.join(config.directory, file)).isDirectory());
    let localFiles = localElements.filter(file => fs.statSync(path.join(config.directory, file)).isFile());

    // Recursively add all descendant folders to subfolders array
    const addLocalSubFolders = (folder) => {
      const subFolders = fs.readdirSync(path.join(config.directory, folder));
      subFolders.forEach(subFolder => {
        const fullPath = path.join(folder, subFolder);
        if (fs.statSync(path.join(config.directory, fullPath)).isDirectory()) {
          localSubFolders.push(fullPath);
          addLocalSubFolders(fullPath);
        } else {
          localFiles.push(fullPath);
        }
      });
    };

    localSubFolders.forEach(folder => addLocalSubFolders(folder));
    localSubFolders = localSubFolders.map(folder => folder.replace(config.directory, ''));

    console.log('Local files:', localFiles);
    console.log('Remote files:', remoteFiles.map(file => file.name));

    // Create folders that exist locally but not remotely
    for (const localSubFolder of localSubFolders) {
      if (!remoteFolders.find(remoteFolder => remoteFolder.name === localSubFolder)) {
        const localSubFolderSplit = localSubFolder.split(path.sep);
        let currentPath = '';
        for (const folder of localSubFolderSplit) {
          currentPath = path.join(currentPath, folder);
          if (!remoteFolders.find(remoteFolder => remoteFolder.name === currentPath)) {
            await createFolder(currentPath);
            remoteFolders.push({ name: currentPath }); // Add to remoteFolders to avoid re-creating
          }
        }
      }
    }
    console.log('Step 1: create folders on remote done');
    // Create folders that exist remotely but not locally
    for (let remoteFolder of remoteFolders) {
      if(remoteFolder.name === 'SyncFolder') {
        continue;
      }
      if (!localSubFolders.includes(remoteFolder.name)) {
        let folderPath = '';
        let currentFolder = remoteFolder;
        // Traverse up the folder hierarchy
        while (currentFolder.parent_id !== config.defaultFolderId) {
          folderPath = path.join(currentFolder.name, folderPath);
          currentFolder = remoteFolders.find(folder => folder.id === currentFolder.parent_id);
        }

        // Prepend the base directory
        folderPath = path.join(config.directory, currentFolder.name, folderPath);

        // Create the folder if it doesn't exist
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
      }
    }
    console.log('Step 2 : create folders locally done');
    // Upload files that exist locally but not remotely or are newer than the remote version
    for (let localFile of localFiles) {
      const localFilePath = path.join(config.directory, localFile);
      const localFileName = path.basename(localFilePath);
      const fileExists = remoteFiles.find(remoteFile => remoteFile.name === localFileName);
      const fileIsNewer = fileExists && fs.statSync(localFilePath).mtime > new Date(fileExists.lastModified);
      
      if (!fileExists || fileIsNewer) {
        await uploadFile(localFilePath);
      }
    }
    console.log('Step 3 : upload files done');

    // Download files that exist remotely but not locally or are newer than the local version
    for (const remoteFile of remoteFiles) {
      let remoteFolder = remoteFolders.find(folder => folder.id === remoteFile.folder_id);
      let folderName = remoteFolder.name; // Initialize folderName
      // Traverse up the folder hierarchy to construct the full path
      while (remoteFolder.parent_id !== null) {
        const parentFolder = remoteFolders.find(folder => folder.id === remoteFolder.parent_id);
        folderName = path.join(parentFolder.name, folderName);
        remoteFolder = parentFolder;
      }
      let localFilePath = path.join(config.localFolder,folderName,remoteFile.name);
      localFilePathSplit = localFilePath.split(path.sep);
      // Remove the first element of the array
      localFilePathSplit.splice(1,1);
      // Join the array back into a string
      localFilePath = localFilePathSplit.join(path.sep);
      

      if (!fs.existsSync(localFilePath) || fs.statSync(localFilePath).mtime < new Date(remoteFile.lastModified)) {
        console.log('Downloading:', remoteFile.name);
        await downloadFile(remoteFile.name, localFilePath);
      }
    }
    console.log('Step 4: download files done');
  } catch (error) {
    console.error('Error during sync:', error.message);
  }
}

syncFiles();
startWatcher();
setInterval(syncFiles, config.pollingInterval);