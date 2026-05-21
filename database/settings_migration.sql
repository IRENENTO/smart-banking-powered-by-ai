-- Migration to create settings tables

-- Security Settings Table
CREATE TABLE IF NOT EXISTS security_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    sms_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    email_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    login_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    session_timeout INT NOT NULL DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_security_settings (user_id)
);

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email_transactions BOOLEAN NOT NULL DEFAULT TRUE,
    sms_transactions BOOLEAN NOT NULL DEFAULT FALSE,
    email_promotions BOOLEAN NOT NULL DEFAULT FALSE,
    sms_promotions BOOLEAN NOT NULL DEFAULT FALSE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_summary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_notification_settings (user_id)
);

-- Privacy Settings Table
CREATE TABLE IF NOT EXISTS privacy_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    data_sharing BOOLEAN NOT NULL DEFAULT FALSE,
    analytics_consent BOOLEAN NOT NULL DEFAULT TRUE,
    marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
    public_profile BOOLEAN NOT NULL DEFAULT FALSE,
    location_tracking BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_privacy_settings (user_id)
);

-- Transaction Limits Table
CREATE TABLE IF NOT EXISTS transaction_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    daily_limit DECIMAL(18, 2) NOT NULL DEFAULT 1000000.00,
    weekly_limit DECIMAL(18, 2) NOT NULL DEFAULT 5000000.00,
    monthly_limit DECIMAL(18, 2) NOT NULL DEFAULT 20000000.00,
    single_transaction_limit DECIMAL(18, 2) NOT NULL DEFAULT 500000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_transaction_limits (user_id)
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'RWF',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Africa/Kigali',
    date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
);
