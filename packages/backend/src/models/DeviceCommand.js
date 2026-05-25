const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeviceCommand = sequelize.define('DeviceCommand', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  commandType: {
    type: DataTypes.ENUM(
      'lock', 'unlock', 'alarm_on', 'alarm_off',
      'wipe', 'track', 'capture_photo', 'capture_video',
      'enable_stealth', 'disable_stealth', 'fake_shutdown',
      'enable_alarm', 'sos_alert'
    ),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'executed', 'failed'),
    defaultValue: 'pending',
  },
  params: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  result: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'device_commands',
});

module.exports = DeviceCommand;
