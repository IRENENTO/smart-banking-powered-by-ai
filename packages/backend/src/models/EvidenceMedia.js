const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EvidenceMedia = sequelize.define('EvidenceMedia', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('photo', 'video', 'audio', 'screenshot'),
    allowNull: false,
  },
  cloudUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  thumbnailUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  mimeType: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  capturedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'evidence_media',
});

module.exports = EvidenceMedia;
