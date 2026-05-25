const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  deviceName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  deviceModel: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  osVersion: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  appVersion: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  deviceId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  simSerial: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  simOperator: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  isProtected: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  stealthMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  stealthIconName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  secretDialCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  isFakeShutdown: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastSeen: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  batteryLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  alarmActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  fcmToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      aiSensitivity: 'medium',
      autoCapture: true,
      geofencing: true,
      smsTracking: true,
      voiceTrigger: false,
      communityNetwork: false,
    },
  },
}, {
  tableName: 'devices',
});

module.exports = Device;
