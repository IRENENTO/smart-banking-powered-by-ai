const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UnlockAttempt = sequelize.define('UnlockAttempt', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  success: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  method: {
    type: DataTypes.ENUM('password', 'pin', 'pattern', 'biometric', 'face'),
    allowNull: false,
  },
  failedPassword: {
    type: DataTypes.STRING(255),
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
  faceCaptured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  attemptedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'unlock_attempts',
});

module.exports = UnlockAttempt;
