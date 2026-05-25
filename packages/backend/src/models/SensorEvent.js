const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SensorEvent = sequelize.define('SensorEvent', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  eventType: {
    type: DataTypes.ENUM(
      'sudden_movement',
      'shake',
      'drop',
      'rotation',
      'shutdown_initiated',
      'sim_removed',
      'sim_changed',
      'network_disconnected',
      'network_changed',
      'power_disconnected',
      'app_hidden',
      'uninstall_attempted'
    ),
    allowNull: false,
  },
  sensorData: {
    type: DataTypes.JSON,
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
  triggeredAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'sensor_events',
  indexes: [
    {
      name: 'idx_sensor_device_type',
      fields: ['device_id', 'event_type', 'triggered_at'],
    },
  ],
});

module.exports = SensorEvent;
