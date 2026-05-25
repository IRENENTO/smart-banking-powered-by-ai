-- Sentinel AI Database Schema
-- Compatible with MySQL 8.0+ and TiDB

CREATE DATABASE IF NOT EXISTS sentinel_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sentinel_ai;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'superadmin') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  is_mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255) NULL,
  biometric_public_key TEXT NULL,
  otp_code VARCHAR(6) NULL,
  otp_expires_at DATETIME NULL,
  refresh_token TEXT NULL,
  last_login_at DATETIME NULL,
  is_active BOOLEAN DEFAULT TRUE,
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  device_name VARCHAR(255) NULL,
  device_model VARCHAR(255) NULL,
  os_version VARCHAR(50) NULL,
  app_version VARCHAR(20) NULL,
  device_id VARCHAR(255) NOT NULL UNIQUE,
  sim_serial VARCHAR(255) NULL,
  sim_operator VARCHAR(100) NULL,
  is_protected BOOLEAN DEFAULT TRUE,
  stealth_mode BOOLEAN DEFAULT FALSE,
  stealth_icon_name VARCHAR(100) NULL,
  secret_dial_code VARCHAR(10) NULL,
  is_fake_shutdown BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen DATETIME NULL,
  battery_level INT DEFAULT 100,
  is_locked BOOLEAN DEFAULT FALSE,
  alarm_active BOOLEAN DEFAULT FALSE,
  fcm_token TEXT NULL,
  settings JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_devices_user (user_id),
  INDEX idx_devices_online (is_online),
  INDEX idx_devices_device_id (device_id)
) ENGINE=InnoDB;

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_id CHAR(36) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  accuracy FLOAT NULL,
  altitude FLOAT NULL,
  speed FLOAT NULL,
  bearing FLOAT NULL,
  battery_level INT NULL,
  network_type VARCHAR(20) NULL,
  is_offline BOOLEAN DEFAULT FALSE,
  recorded_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_locations_device_time (device_id, recorded_at),
  INDEX idx_locations_recorded_at (recorded_at)
) ENGINE=InnoDB;

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id CHAR(36) PRIMARY KEY,
  device_id CHAR(36) NOT NULL,
  type ENUM(
    'suspicious_movement', 'unusual_location', 'failed_unlock',
    'sim_change', 'unauthorized_shutdown', 'network_change',
    'snatch_detected', 'sos_emergency', 'geofence_breach',
    'low_battery', 'device_offline', 'intruder_captured',
    'ai_warning', 'prediction_alert'
  ) NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  metadata JSON NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at DATETIME NULL,
  triggered_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_alerts_device_severity (device_id, severity, triggered_at),
  INDEX idx_alerts_triggered_at (triggered_at)
) ENGINE=InnoDB;

-- Unlock attempts table
CREATE TABLE IF NOT EXISTS unlock_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_id CHAR(36) NOT NULL,
  success BOOLEAN NOT NULL,
  method ENUM('password', 'pin', 'pattern', 'biometric', 'face') NOT NULL,
  failed_password VARCHAR(255) NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  face_captured BOOLEAN DEFAULT FALSE,
  attempted_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_unlock_device (device_id, attempted_at)
) ENGINE=InnoDB;

-- Sensor events table
CREATE TABLE IF NOT EXISTS sensor_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  device_id CHAR(36) NOT NULL,
  event_type ENUM(
    'sudden_movement', 'shake', 'drop', 'rotation',
    'shutdown_initiated', 'sim_removed', 'sim_changed',
    'network_disconnected', 'network_changed',
    'power_disconnected', 'app_hidden', 'uninstall_attempted'
  ) NOT NULL,
  sensor_data JSON NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  triggered_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_sensor_device_type (device_id, event_type, triggered_at)
) ENGINE=InnoDB;

-- Trusted contacts table
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  relationship VARCHAR(50) NULL,
  is_emergency_contact BOOLEAN DEFAULT FALSE,
  notify_on_alert BOOLEAN DEFAULT TRUE,
  can_track_location BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_contacts_user (user_id)
) ENGINE=InnoDB;

-- Geofences table
CREATE TABLE IF NOT EXISTS geofences (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  device_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  radius INT NOT NULL COMMENT 'Radius in meters',
  type ENUM('home', 'work', 'school', 'safe', 'restricted') NOT NULL,
  notify_on_enter BOOLEAN DEFAULT FALSE,
  notify_on_exit BOOLEAN DEFAULT TRUE,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_geofences_device (device_id)
) ENGINE=InnoDB;

-- Evidence media table
CREATE TABLE IF NOT EXISTS evidence_media (
  id CHAR(36) PRIMARY KEY,
  alert_id CHAR(36) NOT NULL,
  type ENUM('photo', 'video', 'audio', 'screenshot') NOT NULL,
  cloud_url TEXT NULL,
  thumbnail_url TEXT NULL,
  file_size INT NULL,
  mime_type VARCHAR(50) NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  metadata JSON NULL,
  captured_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
  INDEX idx_evidence_alert (alert_id)
) ENGINE=InnoDB;

-- Backups table
CREATE TABLE IF NOT EXISTS backups (
  id CHAR(36) PRIMARY KEY,
  device_id CHAR(36) NOT NULL,
  type ENUM('contacts', 'photos', 'messages', 'files', 'full') NOT NULL,
  cloud_path TEXT NOT NULL,
  size BIGINT NULL,
  file_count INT DEFAULT 0,
  encrypted BOOLEAN DEFAULT TRUE,
  encryption_key TEXT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT NULL,
  completed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_backups_device (device_id)
) ENGINE=InnoDB;

-- Device commands table
CREATE TABLE IF NOT EXISTS device_commands (
  id CHAR(36) PRIMARY KEY,
  device_id CHAR(36) NOT NULL,
  command_type ENUM(
    'lock', 'unlock', 'alarm_on', 'alarm_off',
    'wipe', 'track', 'capture_photo', 'capture_video',
    'enable_stealth', 'disable_stealth', 'fake_shutdown',
    'enable_alarm', 'sos_alert'
  ) NOT NULL,
  status ENUM('pending', 'sent', 'delivered', 'executed', 'failed') DEFAULT 'pending',
  params JSON NULL,
  result JSON NULL,
  issued_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_commands_device_status (device_id, status)
) ENGINE=InnoDB;

-- AI analyses table
CREATE TABLE IF NOT EXISTS ai_analyses (
  id CHAR(36) PRIMARY KEY,
  device_id CHAR(36) NOT NULL,
  analysis_type VARCHAR(50) NOT NULL,
  risk_score FLOAT NOT NULL COMMENT '0-100 risk score',
  confidence FLOAT NULL COMMENT '0-1 confidence level',
  pattern_data JSON NULL,
  recommendation TEXT NULL,
  triggered_action VARCHAR(100) NULL,
  analyzed_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  INDEX idx_ai_device_type_score (device_id, analysis_type, risk_score)
) ENGINE=InnoDB;
