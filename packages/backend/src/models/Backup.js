const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Backup = sequelize.define('Backup', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('contacts', 'photos', 'messages', 'files', 'full'),
    allowNull: false,
  },
  cloudPath: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  size: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  fileCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  encrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  encryptionKey: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'backups',
});

module.exports = Backup;
