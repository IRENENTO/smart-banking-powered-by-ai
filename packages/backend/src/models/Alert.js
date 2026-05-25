const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM(
      'suspicious_movement',
      'unusual_location',
      'failed_unlock',
      'sim_change',
      'unauthorized_shutdown',
      'network_change',
      'snatch_detected',
      'sos_emergency',
      'geofence_breach',
      'low_battery',
      'device_offline',
      'intruder_captured',
      'ai_warning',
      'prediction_alert'
    ),
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
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
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  triggeredAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'alerts',
  indexes: [
    {
      name: 'idx_alert_device_severity',
      fields: ['device_id', 'severity', 'triggered_at'],
    },
  ],
});

module.exports = Alert;
