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
    return response.data.id;
  } catch (error) {
    console.error(`Failed to get folder ID for ${folderName}:`, error.message);
  }
}

async function getParentFolderId(folderName) {
  try {
    const response = await axios.get(`${config.apiBaseUrl}/sync/${folderName}/parent-id`, {
      headers: {
        'Authorization': config.authToken,
      },
    });
    return response.data.id;
  } catch (error) {
    console.error(`Failed to get parent folder ID for ${folderName}:`, error.message);
  }
}


async function uploadFile(filePath, retries = 0) {
  try {
    const relativePath = path.relative(config.directory, filePath);
    const formData = new FormData();
    formData.append('files', fs.createReadStream(filePath));
    
    const folderId = await getFolderIdFromPath(relativePath);
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

async function getFolderIdFromPath(relativePath) {
  const folderName = path.basename(path.dirname(relativePath));
  return await getFolderId(folderName);
}

async function createFolder(folderName, parentFolderId = config.defaultFolderId) {
  try {
    const { finalFolderName, finalParentFolderId } = await getFolderDetails(folderName, parentFolderId);

    
    const response = await axios.post(`${config.apiBaseUrl}/folders/`, {
      name: finalFolderName,
      email: config.email,
      parent_id: finalParentFolderId,
    });
    if (response.data && response.data.success) {
      console.log(`Folder created: ${finalFolderName}`);
    } else {
      console.error(`Failed to create folder: ${finalFolderName}`);
    }
  } catch (error) {
    console.error(`Error creating folder ${folderName}:`, error);
  }
}

async function getFolderDetails(folderName, parentFolderId) {
  const folderPath = folderName.split(path.sep);
  if (folderPath.length > 1) {
    const finalFolderName = folderPath.pop();
    const finalParentFolderId = await getParentFolderId(finalFolderName);
    return { finalFolderName, finalParentFolderId };
  }
  return { finalFolderName: folderName, finalParentFolderId: parentFolderId };
}

async function downloadFile(fileName, destinationPath) {
  try {
    const response = await axios.get(`${config.apiBaseUrl}/sync/download/${fileName}`, {
      headers: {
        'Authorization': config.authToken,
      },
      responseType: 'arraybuffer',
    });
    fs.writeFileSync(destinationPath, response.data);
    console.log(`Downloaded: ${fileName} into ${destinationPath}`);
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