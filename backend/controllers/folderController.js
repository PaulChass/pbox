const Folder = require('../models/Folder');
const User = require('../models/User');
const File = require('../models/File');
const archiver = require('archiver');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const  Busboy  = require('busboy');


// Fetch all folders for a specific user
exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Folder,
          as: 'subfolders'  // Assuming this is correctly defined in your model
        }
      ]
    });
    res.json(folders);
  } catch (error) {
    console.log(Folder);
    console.error('Failed to fetch folders:', error.message);
    res.statuus(500).json({ error: 'Failed to fetch folders' });
  }
};

// Create a new folder post body should contain 'name' and 'parent_id' fields
exports.createFolder = async (req, res) => {
  const { name, parent_id, email } = req.body;
  const user = await User.findOne({ where: { email } });
  try {
    const newFolder = await Folder.create({
      name,
      parent_id,
      user_id: user.dataValues.id
    });
    res.status(201).json(newFolder);


  } catch (error) {
    console.error('Failed to create folder:', error.message);
    res.status(500).json({ error: 'Failed to create folder' });
  }

};

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderId = req.params.folderId; // Get folderId from request params
    const uploadPath = path.join(__dirname, '..', 'uploads', folderId);
    console.log(`Uploading to folder: ${uploadPath}`);

    // Ensure the folder exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath); // Use the created directory
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  }
});

const upload = multer({ storage });


async function ensureFolderStructure(folderPath, rootFolderId) {
  let currentParentId = rootFolderId; // Start with the root folder ID
  const pathParts = folderPath.split('/'); 
  for (const part of pathParts) {
    if (!part) continue; 
    let folder = await Folder.findOne({ where: { name: part, parent_id: currentParentId } });
    if (!folder) {
      folder = await Folder.create({ name: part, parent_id: currentParentId });
    }
    currentParentId = folder.id; // Update currentParentId for the next iteration
  }

  return currentParentId; // Return the ID of the last folder in the path
}

// Upload files to a specific folder
exports.uploadFiles = (req, res) => {
  const rootFolderId = req.params.folderId; // This is the ID of the folder where the upload was initiated
  
  upload.array('files')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(500).json({ error: 'Failed to upload files' });
    } else if (err) {
      console.error('Unknown error during upload:', err);
      return res.status(500).json({ error: 'Failed to upload files' });
    }
    console.log('Req Files',req.files);

    try {
      for (const file of req.files) {
        // Ensure the folder structure for each file and get the folder_id
        const folderId = await ensureFolderStructure(file.folderPath || '', rootFolderId);
        
        let fileName = file.originalname;
        // Check if file exists in the database
        let fileNameAvailable = false;
        let i = 1;
        while(fileNameAvailable === false){
        const existingFile = await File.findOne({ where: { name: fileName, folder_id: folderId } });
        if (existingFile) {
          console.log(`File ${file.originalname} already exists in folder ${folderId}`);
          const nameSplit  = file.originalname.split('.');
          fileName = `${nameSplit[0]}(${i})${nameSplit[1]}`;
          i++;
        } else {fileNameAvailable = true;}
        }

        // Create the file record with the correct folder_id
        await File.create({
          name: fileName,
          path: file.path,
          size: file.size,
          folder_id: folderId || null, // Use the folder_id obtained from ensureFolderStructure
        });
      }

      console.log("Files uploaded and saved successfully");
      res.status(200).json({ message: 'Files uploaded and saved successfully' });
    } catch (error) {
      console.error('Error processing files:', error);
      res.status(500).json({ error: 'Failed to process files' });
    }
  });
};


// Fetch files for a specific folder
exports.fetchFiles = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const files = await File.findAll({ where: { folder_id: folderId } }); // Adjust according to your schema
    res.json(files);
  } catch (error) {
    console.error('Failed to fetch files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

const calculateFolderSize = async (folderId) => {
  const files = await File.findAll({ where: { folder_id: folderId } });
  let totalSize = 0;
  for (const file of files) {
    totalSize += file.size;
  }


  const subfolders = await Folder.findAll({ where: { parent_id: folderId } });
  for (const subfolder of subfolders) {
    totalSize += await calculateFolderSize(subfolder.id);
  }
  
  return totalSize;
};

// Add a folder to the archive recursively
const addFolderToArchive = async (archive, folder, baseFolderPath, baseArchivePath) => {
  console.log(`Adding folder to archive: ${baseFolderPath}`);
  const files = await File.findAll({ where: { folder_id: folder.id } });
  for (const file of files) {
    const filePath = path.join(baseFolderPath, file.name);
    console.log(`Checking file path: ${filePath}`);
    if (fs.existsSync(filePath)) {
      const archiveFilePath = path.join(baseArchivePath, file.name);
      console.log(`Adding file to archive: ${filePath} as ${archiveFilePath}`);
      archive.file(filePath, { name: archiveFilePath });
    } else {
      console.log(`File not found: ${filePath}`);
    }
  }

  // Add subfolders recursively to the archive
  const subfolders = await Folder.findAll({ where: { parent_id: folder.id } });
  for (const subfolder of subfolders) {
    const subfolderPath = path.join(__dirname, '..', 'uploads', subfolder.id.toString());
    const subfolderArchivePath = path.join(baseArchivePath, subfolder.name);
    console.log('Subfolder path:', subfolderPath);
    console.log('Subfolder Archive Path:', subfolderArchivePath);
    console.log(`Adding subfolder to archive: ${subfolderPath} as ${subfolderArchivePath}`);
    await addFolderToArchive(archive, subfolder, subfolderPath, subfolderArchivePath);
  }

  
};

// Sanitize folder name by removing or replacing invalid characters
function sanitizeFolderName(folderName) {
  const invalidChars = {
    '?': '', 
    '<': '',
    '>': '',
    ':': '',
    '"': '',
    '/': '',
    '\\': '',
    '|': '',
    '*': ''
  };
  let sanitizedFolderName = folderName;
  for (const [invalidChar, replacement] of Object.entries(invalidChars)) {
    sanitizedFolderName = sanitizedFolderName.split(invalidChar).join(replacement);
  }
  
  return sanitizedFolderName;
}


exports.downloadFolder = async (req, res) => {
  const folderId = req.params.folderId;
  const totalSize = await calculateFolderSize(folderId);
  res.setHeader('Content-Length', totalSize);
  try {
    const folder = await Folder.findByPk(folderId);
    let bytesSent = 0;  
   
    console.log(`Folder size: ${totalSize} bytes`);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    const sanitizedFolderName = sanitizeFolderName(folder.name);


    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level
    });

    res.attachment(`${sanitizedFolderName}.zip`);

    archive.on('error', (err) => {
      throw err;
    });
    archive.on('data', chunk => {
      bytesSent += chunk.length;
      console.log(`Sent ${bytesSent} of ${totalSize} bytes (${((bytesSent / totalSize) * 100).toFixed(2)}%)`);
      
    });
    archive.pipe(res);

    const folderPath = path.join(__dirname, '..', 'uploads', folderId);
    console.log(`Starting to add folder to archive: ${folderPath}`);
    await addFolderToArchive(archive, folder, folderPath, sanitizedFolderName);

    await archive.finalize();
    
  } catch (error) {
    console.error('Failed to download folder:', error);
    res.status(500).json({ error: 'Failed to download folder' });
  }
};


const deleteRecursively = async (folderId) => {
  const files = await File.findAll({ where: { folder_id: folderId } });

  for (const file of files) {
    console.log(`Deleting file: ${file.path}`);
    try {
      // Properly await the promise-based unlink function
      await fs.unlink(file.path, (err) => { if (err) throw err; });
    } catch (err) {
      console.error('Error deleting the file from the file system:', err);
      throw err; // Rethrow or handle as needed
    }

    // Delete the file record from the database
    await file.destroy();
  }

  const subfolders = await Folder.findAll({ where: { parent_id: folderId } });
  for (const subfolder of subfolders) {
    await deleteRecursively(subfolder.id);
  }

  // Delete the folder itself after its contents have been cleared
  const folder = await Folder.findByPk(folderId);
  if (folder) {
    await folder.destroy();
  }
};

// Adjust the exports.deleteFolder function to use deleteRecursively for a complete cleanup
exports.deleteFolder = async (req, res) => {
  const folderId = req.params.folderId;
  try {
    await deleteRecursively(folderId); // Use the revised recursive deletion
    res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Failed to delete folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};

exports.renameFolder = async (req, res) => {
  const folderId = req.params.folderId;
  const { name } = req.body;

  try {
    const folder = await Folder.findByPk(folderId);
    if (!folder) {
      return res.status(404).send('Folder not found');
    }
    folder.name = name;
    await folder.save();
    res.status(200).json({ message: 'Folder renamed successfully' });
  } catch (error) {
    console.error('Failed to rename folder:', error);
    res.status(500).json({ error: 'Failed to rename folder' });
  }
}


exports.moveFolder = async (req, res) => {
  const folderId = req.params.folderId;
  let newParentId = req.params.newFolderId;
  if (!newParentId) {
    newParentId = null;
  }
  console.log('Folder ID:', req.body);
  console.log('New Parent ID:', newParentId);
  try {
    const folder = await Folder.findByPk(folderId);
    if (!folder) {
      return res.status(404).send('Folder not found');
    }

    folder.parent_id = newParentId;
    await folder.save();

    res.status(200).json({ message: 'Folder moved successfully' });
  } catch (error) {
    console.error('Failed to move folder:', error);
    res.status(500).json({ error: 'Failed to move folder' });
  }
}
