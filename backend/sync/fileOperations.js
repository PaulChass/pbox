const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const config = require('./config');

async function getFolderId(folderName) {
  try {
    const response = await axios.get(`${config.apiBaseUrl}/sync/${folderName}/id`, {
      headers: {
        'Authorization': config.authToken,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to get folder ID for ${folderName}:`, error.message);
  }
}


async function uploadFile(filePath, retries = 0) {
  try {
    const relativePath = path.relative(config.directory, filePath);
    const formData = new FormData();
    formData.append('files', fs.createReadStream(filePath));
    
    const folderId = await getFolderIdFromPath(filePath);
    if (!folderId) {
      throw new Error('Folder ID is undefined');
    }
    formData.append('folderId', folderId);
    formData.append('relativePath', relativePath);

    await axios.post(`${config.apiBaseUrl}/folders/${folderId}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': config.authToken,
      },
      timeout: 300000,
    });
    console.log(`Uploaded: ${relativePath}`);
  } catch (error) {
    handleUploadError(error, filePath, retries);
  }
}

async function getFolderIdFromPath(filePath) {
  const folderPath = path.dirname(filePath);
  const folderName = path.basename(folderPath);
  console.log(`Folder name: ${folderName}`);
  let folderID = await getFolderId(folderName);
  if (!folderID) {
    folderID = await createFolder(folderName);
  }
  return folderID;
}

async function createFolder(folderName, parentFolderId = config.defaultFolderId) {
  try {
    const { finalFolderName, finalParentFolderId } = await getFolderDetails(folderName, parentFolderId);
    if(finalFolderName === 'Films') { //skip creating folder Films
      return;
    }
    console.log(`Creating folder: ${finalFolderName}`);
    console.log(`Parent folder ID: ${finalParentFolderId}`);

    // Check if folder already exists
    const existingFolderId = await getFolderId(finalFolderName);
    if (existingFolderId) {
      console.log(`Folder ${finalFolderName} already exists.`);
      return existingFolderId;
    }

    const response = await axios.post(`${config.apiBaseUrl}/folders/`, {
      name: finalFolderName,
      email: config.email,
      parent_id: finalParentFolderId,
    });
    if (response.data && response.data.success) {
      console.log(`Folder created: ${finalFolderName}`);
      return response.data.id;
    } else {
      console.error(`Failed to create folder: ${finalFolderName}`);
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.error(`Error creating folder ${folderName}: Folder already exists.`);
    } else {
      console.error(`Error creating folder ${folderName}:`, error.message);
    }
  }
}

async function getFolderDetails(folderName, parentFolderId) {
  const folderPath = folderName.split(path.sep);
  if (folderPath.length > 1) {
    const finalFolderName = folderPath[folderPath.length - 1];
    const parentFolderName = folderPath[folderPath.length - 2];
    console.log(`parentName: ${parentFolderName}`); 
    let finalParentFolderId = await getFolderId(parentFolderName);
    if (!finalParentFolderId || finalParentFolderId === undefined) {
      finalParentFolderId = config.defaultFolderId;
    }
    return { finalFolderName, finalParentFolderId };
  }
  return { finalFolderName: folderName, finalParentFolderId: parentFolderId };
}

async function downloadFile(fileName, destinationPath) {
  try {
    const response = await axios({
      method: 'get',
      url: `${config.apiBaseUrl}/sync/download/${fileName}`,
      headers: {
        'Authorization': config.authToken,
      },
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(destinationPath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      console.log(`Downloaded: ${fileName} into ${destinationPath}`);
    });

    writer.on('error', (err) => {
      console.error(`Error writing file: ${err.message}`);
    });
  } catch (error) {
    handleDownloadError(error, fileName);
  }
}

async function deleteFileOnServer(fileName) {
  try {
    await axios.delete(`${config.apiBaseUrl}/sync/${fileName}/delete`, {
      headers: {
        'Authorization': config.authToken,
      },
    });
    console.log(`Deleted on server: ${fileName}`);
  } catch (error) {
    console.error(`Failed to delete ${fileName} on server:`, error.message);
  }
}

function handleUploadError(error, filePath, retries) {
  if ((error.code === 'ECONNRESET' || error.response?.status === 500) && retries < config.maxRetries) {
    console.warn(`Error occurred. Retrying upload (${retries + 1}/${config.maxRetries})...`);
    setTimeout(() => uploadFile(filePath, retries + 1), config.retryDelay);
  } else if (error.code === 'ENOENT') {
    console.error(`File not found: ${filePath}`);
  } else if (error.code === 'EACCES') {
    console.error(`Permission denied: ${filePath}`);
  } else {
    console.error(`Failed to upload ${filePath}:`, error.message);
  }
}

function handleDownloadError(error, fileName) {
  if (error.response && error.response.status === 404) {
    console.error(`File not found on server: ${fileName}`);
  } else {
    console.error(`Failed to download ${fileName}:`, error.message);
  }
}

module.exports = {
  uploadFile,
  downloadFile,
  deleteFileOnServer,
  createFolder,
};