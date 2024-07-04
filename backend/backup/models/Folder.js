const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User'); // Assuming you have a User model

const Folder = sequelize.define('Folder', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Folders',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
});

Folder.belongsTo(User, { foreignKey: 'user_id' });
Folder.hasMany(Folder, { as: 'subfolders', foreignKey: 'parent_id' });

module.exports = Folder;