const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
  accuracy: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  altitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  speed: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  bearing: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  batteryLevel: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  networkType: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  isOffline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recordedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'locations',
  indexes: [
    {
      name: 'idx_device_recorded',
      fields: ['device_id', 'recorded_at'],
    },
  ],
});

module.exports = Location;
