const sequelize = require('../config/database');
const User = require('./User');
const Device = require('./Device');
const Location = require('./Location');
const Alert = require('./Alert');
const UnlockAttempt = require('./UnlockAttempt');
const SensorEvent = require('./SensorEvent');
const TrustedContact = require('./TrustedContact');
const Geofence = require('./Geofence');
const EvidenceMedia = require('./EvidenceMedia');
const Backup = require('./Backup');
const DeviceCommand = require('./DeviceCommand');
const AiAnalysis = require('./AiAnalysis');

User.hasMany(Device, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Device.belongsTo(User, { foreignKey: 'user_id' });

Device.hasMany(Location, { foreignKey: 'device_id', onDelete: 'CASCADE' });
Location.belongsTo(Device, { foreignKey: 'device_id' });

Device.hasMany(Alert, { foreignKey: 'device_id', onDelete: 'CASCADE' });
Alert.belongsTo(Device, { foreignKey: 'device_id' });

Device.hasMany(UnlockAttempt, { foreignKey: 'device_id', onDelete: 'CASCADE' });
UnlockAttempt.belongsTo(Device, { foreignKey: 'device_id' });

Device.hasMany(SensorEvent, { foreignKey: 'device_id', onDelete: 'CASCADE' });
SensorEvent.belongsTo(Device, { foreignKey: 'device_id' });

Device.hasMany(Geofence, { foreignKey: 'device_id', onDelete: 'CASCADE' });
Geofence.belongsTo(Device, { foreignKey: 'device_id' });

Alert.hasMany(EvidenceMedia, { foreignKey: 'alert_id', onDelete: 'CASCADE' });
EvidenceMedia.belongsTo(Alert, { foreignKey: 'alert_id' });

User.hasMany(TrustedContact, { foreignKey: 'user_id', onDelete: 'CASCADE' });
TrustedContact.belongsTo(User, { foreignKey: 'user_id' });

Device.hasMany(Backup, { foreignKey: 'device_id', onDelete: 'CASCADE' });
Backup.belongsTo(Device, { foreignKey: 'device_id' });

Device.hasMany(DeviceCommand, { foreignKey: 'device_id', onDelete: 'CASCADE' });
DeviceCommand.belongsTo(Device, { foreignKey: 'device_id' });

Device.hasMany(AiAnalysis, { foreignKey: 'device_id', onDelete: 'CASCADE' });
AiAnalysis.belongsTo(Device, { foreignKey: 'device_id' });

module.exports = {
  sequelize,
  User,
  Device,
  Location,
  Alert,
  UnlockAttempt,
  SensorEvent,
  TrustedContact,
  Geofence,
  EvidenceMedia,
  Backup,
  DeviceCommand,
  AiAnalysis,
};
