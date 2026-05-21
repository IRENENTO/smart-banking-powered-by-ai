-- Admin System Tables Migration
-- Created for AI Banking Admin Dashboard

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    admin_id INT,
    type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Savings Goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    goal_name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0,
    target_date DATE,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- AI Market Insights table
CREATE TABLE IF NOT EXISTS ai_market_insights (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    market_sector VARCHAR(100),
    risk_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    confidence_score DECIMAL(5, 2),
    trend VARCHAR(50),
    market_data JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_market_sector (market_sector),
    INDEX idx_created_at (created_at)
);

-- AI Predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    prediction_type VARCHAR(100) NOT NULL,
    predicted_value VARCHAR(255),
    confidence DECIMAL(5, 2),
    actual_value VARCHAR(255),
    accuracy DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_prediction_type (prediction_type)
);

-- Login History table
CREATE TABLE IF NOT EXISTS login_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    admin_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_method ENUM('email', 'oauth', 'otp') DEFAULT 'email',
    status ENUM('success', 'failed', 'suspicious') DEFAULT 'success',
    device_info JSON,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
);

-- Fraud Alerts table
CREATE TABLE IF NOT EXISTS fraud_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    alert_type VARCHAR(100),
    description TEXT,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'reviewed', 'resolved', 'false_positive') DEFAULT 'pending',
    suspicious_activity JSON,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    action_taken VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_severity (severity),
    INDEX idx_status (status)
);

-- User Activity Logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    admin_id INT,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id INT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- Investment Recommendations table
CREATE TABLE IF NOT EXISTS investment_recommendations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    investment_type VARCHAR(100),
    description TEXT,
    recommended_amount DECIMAL(12, 2),
    expected_return DECIMAL(5, 2),
    risk_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    ai_confidence DECIMAL(5, 2),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_created_at (created_at),
    INDEX idx_entity_type (entity_type)
);

-- Insert default admin user (password: irene12003)
INSERT INTO admins (email, password_hash, name, role, status) 
VALUES (
    'smartbankingpoweredbyai@gmail.com',
    '$2a$10$O48qKRkN3cxbsv3MWoISAO8.NRHd1vJGtFIyVCBVZDf8tAddl47k.', -- bcrypt hash of "irene12003"
    'Admin User',
    'super_admin',
    'active'
) ON DUPLICATE KEY UPDATE
    password_hash = '$2a$10$O48qKRkN3cxbsv3MWoISAO8.NRHd1vJGtFIyVCBVZDf8tAddl47k.',
    name = 'Admin User',
    role = 'super_admin',
    status = 'active';

-- Create indexes for performance optimization
CREATE INDEX idx_admins_created_at ON admins(created_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_fraud_alerts_created_at ON fraud_alerts(created_at);
CREATE INDEX idx_login_history_created_at ON login_history(created_at);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
