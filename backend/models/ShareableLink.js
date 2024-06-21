const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ShareableLink = sequelize.define('ShareableLink', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('private', 'public'),
    allowNull: false,
  },
  folderId: {
    type: DataTypes.INTEGER, // Assuming fileId refers to the File or Folder ID
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'shareable_links',
});

module.exports = ShareableLink;
