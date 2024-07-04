const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Folder = require('./Folder'); // Assuming the Folder model is in the same directory

class File extends Model { }

File.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  folder_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Folder, // This references the Folder model
      key: 'id',
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'File',
});

// Establishing the relationship
Folder.hasMany(File, { foreignKey: 'folder_id' });
File.belongsTo(Folder, { foreignKey: 'folder_id' });

module.exports = File;
