const  Folder  = require('../models/Folder');
const User = require('../models/User');

// Fetch folder structure for a specific user
exports.getFolders = async (req, res) => {
    try {
        const folders = await Folder.findAll({
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
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
};

// Create a new folder
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
