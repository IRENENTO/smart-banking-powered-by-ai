const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Geofence = sequelize.define('Geofence', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
  radius: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Radius in meters',
  },
  type: {
    type: DataTypes.ENUM('home', 'work', 'school', 'safe', 'restricted'),
    allowNull: false,
  },
  notifyOnEnter: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  notifyOnExit: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'geofences',
});

module.exports = Geofence;
