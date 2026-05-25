const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrustedContact = sequelize.define('TrustedContact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  relationship: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  isEmergencyContact: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  notifyOnAlert: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  canTrackLocation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'trusted_contacts',
});

module.exports = TrustedContact;
