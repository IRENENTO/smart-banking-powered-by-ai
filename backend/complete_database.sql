-- ============================================================================
-- COMPLETE DATABASE SCHEMA + SEED DATA
-- Database: smart_banking_powered_by_ai (MySQL)
-- Generated for AI Banking project export/import
-- ============================================================================

CREATE DATABASE IF NOT EXISTS smart_banking_powered_by_ai
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smart_banking_powered_by_ai;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- DROP EXISTING OBJECTS (clean slate)
-- ============================================================================

DROP VIEW IF EXISTS user_dashboard;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS investment_recommendations;
DROP TABLE IF EXISTS user_activity_logs;
DROP TABLE IF EXISTS fraud_alerts;
DROP TABLE IF EXISTS login_history;
DROP TABLE IF EXISTS ai_predictions;
DROP TABLE IF EXISTS ai_market_insights;
DROP TABLE IF EXISTS cms_sections;
DROP TABLE IF EXISTS statements;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS transaction_limits;
DROP TABLE IF EXISTS privacy_settings;
DROP TABLE IF EXISTS notification_settings;
DROP TABLE IF EXISTS security_settings;
DROP TABLE IF EXISTS investment_types;
DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS payment_providers;
DROP TABLE IF EXISTS payment_categories;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS payment_schedules;
DROP TABLE IF EXISTS ai_insights;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS beneficiaries;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS savings_goals;
DROP TABLE IF EXISTS loan_repayments;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS user_security;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- TABLE: users
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(500),
    role ENUM('user', 'admin') DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    pin_set BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(6),
    otp_expires_at DATETIME NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    account_number VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_account_number (account_number)
);

-- ============================================================================
-- TABLE: admins
-- ============================================================================
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
    INDEX idx_status (status),
    INDEX idx_admins_created_at (created_at)
);

-- ============================================================================
-- TABLE: user_profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date_of_birth DATE,
    address TEXT,
    national_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_profile (user_id)
);

-- ============================================================================
-- TABLE: user_security
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_security (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_pin VARCHAR(255) NOT NULL DEFAULT '',
    pin_attempts INT DEFAULT 0,
    pin_locked_until DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_security (user_id)
);

-- ============================================================================
-- TABLE: accounts
-- ============================================================================
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'RWF',
    account_type VARCHAR(50) DEFAULT 'savings',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: transactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('deposit', 'withdrawal', 'transfer', 'payment', 'loan_disbursement', 'loan_repayment') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(500),
    reference_number VARCHAR(100) UNIQUE,
    recipient_account_number VARCHAR(20),
    recipient_name VARCHAR(255),
    category VARCHAR(50) DEFAULT 'other',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_reference_number (reference_number),
    INDEX idx_created_at (created_at)
);

-- ============================================================================
-- TABLE: loans (unified with all columns from ALTER TABLE migrations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    purpose VARCHAR(500),
    monthly_income DECIMAL(18,2),
    existing_debt DECIMAL(18,2),
    ai_decision TEXT,
    duration_months INT NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 10.00,
    monthly_payment DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    status ENUM('pending', 'approved', 'rejected', 'disbursed', 'completed', 'defaulted') DEFAULT 'pending',
    risk_score DECIMAL(5,2),
    deduction_amount DECIMAL(15,2) DEFAULT NULL,
    deduction_period ENUM('daily','weekly','monthly') DEFAULT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    next_deduction_date DATE DEFAULT NULL,
    extensions JSON DEFAULT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date DATETIME NULL,
    disbursement_date DATETIME NULL,
    due_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- ============================================================================
-- TABLE: loan_repayments
-- ============================================================================
CREATE TABLE IF NOT EXISTS loan_repayments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method ENUM('bank_transfer', 'cash', 'auto_debit') DEFAULT 'bank_transfer',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_loan_id (loan_id),
    INDEX idx_user_id (user_id),
    INDEX idx_payment_date (payment_date)
);

-- ============================================================================
-- TABLE: savings_goals (unified with auto-deduction columns)
-- ============================================================================
CREATE TABLE IF NOT EXISTS savings_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    target_date DATE,
    status ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
    auto_deduction_amount DECIMAL(15,2) DEFAULT NULL,
    auto_deduction_period ENUM('daily','weekly','monthly') DEFAULT NULL,
    last_deduction_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- ============================================================================
-- TABLE: notifications (unified with admin columns)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ============================================================================
-- TABLE: beneficiaries
-- ============================================================================
CREATE TABLE IF NOT EXISTS beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    bank_name VARCHAR(255),
    relationship VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_account_number (account_number)
);

-- ============================================================================
-- TABLE: cards (unified from core + settings migrations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_number VARCHAR(20) NOT NULL,
    card_type ENUM('debit', 'credit', 'virtual') DEFAULT 'debit',
    card_brand ENUM('visa', 'mastercard', 'amex') DEFAULT 'visa',
    card_holder_name VARCHAR(100),
    expiry_date VARCHAR(10) NOT NULL,
    cvv VARCHAR(4),
    status ENUM('active', 'blocked', 'expired', 'cancelled') DEFAULT 'active',
    is_default BOOLEAN DEFAULT FALSE,
    daily_limit DECIMAL(15,2) DEFAULT 1000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 10000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_card_number (card_number),
    INDEX idx_status (status)
);

-- ============================================================================
-- TABLE: ai_insights
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: payment_schedules
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    recipient_type ENUM('phone','account') DEFAULT 'account',
    recipient_value VARCHAR(50) NOT NULL DEFAULT '',
    amount DECIMAL(15,2) NOT NULL,
    frequency ENUM('daily','weekly','monthly') NOT NULL DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE,
    next_payment_date DATE NOT NULL,
    status ENUM('active','paused','completed','cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE: payments
-- ============================================================================
-- Fix: add 'deposit' and 'withdrawal' to existing tables if they were created before the migration
ALTER TABLE payments
MODIFY COLUMN payment_type ENUM('bill', 'merchant', 'subscription', 'invoice', 'top_up', 'other', 'deposit', 'withdrawal') NOT NULL;

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    payment_type ENUM('bill', 'merchant', 'subscription', 'invoice', 'top_up', 'other', 'deposit', 'withdrawal') NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_reference VARCHAR(100),
    account_or_phone VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RWF',
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    description VARCHAR(500),
    metadata JSON,
    transaction_reference VARCHAR(100) UNIQUE,
    balance_before DECIMAL(15,2),
    balance_after DECIMAL(15,2),
    paid_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_payment_type (payment_type),
    INDEX idx_status (status),
    INDEX idx_provider (provider),
    INDEX idx_transaction_reference (transaction_reference),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: payment_methods
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    method_type ENUM('card', 'mobile_money', 'bank_account', 'wallet') NOT NULL,
    provider_name VARCHAR(100) NOT NULL,
    account_identifier VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_method_type (method_type),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: payment_categories
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: payment_providers
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    provider_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    min_amount DECIMAL(15,2) DEFAULT 0,
    max_amount DECIMAL(15,2) DEFAULT 999999.99,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES payment_categories(id) ON DELETE SET NULL,
    INDEX idx_category_id (category_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: investments
-- ============================================================================
CREATE TABLE IF NOT EXISTS investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    duration INT NOT NULL,
    risk_level ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    expected_return DECIMAL(5,2) NOT NULL,
    actual_return DECIMAL(15,2) DEFAULT 0,
    status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_investments (user_id),
    INDEX idx_investment_type (type),
    INDEX idx_investment_status (status)
);

-- ============================================================================
-- TABLE: investment_types
-- ============================================================================
CREATE TABLE IF NOT EXISTS investment_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_amount DECIMAL(15,2) NOT NULL DEFAULT 5000,
    allowed_risk_levels JSON NOT NULL,
    expected_returns JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: security_settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS security_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    sms_alerts BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT TRUE,
    login_notifications BOOLEAN DEFAULT TRUE,
    session_timeout INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_security_user (user_id)
);

-- ============================================================================
-- TABLE: notification_settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email_transactions BOOLEAN DEFAULT TRUE,
    sms_transactions BOOLEAN DEFAULT FALSE,
    email_promotions BOOLEAN DEFAULT FALSE,
    sms_promotions BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    weekly_summary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id)
);

-- ============================================================================
-- TABLE: privacy_settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS privacy_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    data_sharing BOOLEAN DEFAULT FALSE,
    analytics_consent BOOLEAN DEFAULT TRUE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    public_profile BOOLEAN DEFAULT FALSE,
    location_tracking BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_privacy_user (user_id)
);

-- ============================================================================
-- TABLE: transaction_limits
-- ============================================================================
CREATE TABLE IF NOT EXISTS transaction_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    daily_limit DECIMAL(15,2) DEFAULT 1000000.00,
    weekly_limit DECIMAL(15,2) DEFAULT 5000000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 20000000.00,
    single_transaction_limit DECIMAL(15,2) DEFAULT 500000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_limits_user (user_id)
);

-- ============================================================================
-- TABLE: user_preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'RWF',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Africa/Kigali',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_preferences_user (user_id)
);

-- ============================================================================
-- TABLE: statements
-- ============================================================================
CREATE TABLE IF NOT EXISTS statements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    statement_type VARCHAR(20) NOT NULL,
    statement_period VARCHAR(50) NOT NULL,
    file_path VARCHAR(255),
    file_size INT,
    download_count INT DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_statements_user (user_id),
    INDEX idx_statements_period (statement_period)
);

-- ============================================================================
-- TABLE: ai_market_insights
-- ============================================================================
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

-- ============================================================================
-- TABLE: ai_predictions
-- ============================================================================
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

-- ============================================================================
-- TABLE: login_history
-- ============================================================================
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

-- ============================================================================
-- TABLE: fraud_alerts
-- ============================================================================
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
    INDEX idx_status (status),
    INDEX idx_fraud_alerts_created_at (created_at)
);

-- ============================================================================
-- TABLE: user_activity_logs
-- ============================================================================
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

-- ============================================================================
-- TABLE: investment_recommendations
-- ============================================================================
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

-- ============================================================================
-- TABLE: audit_logs
-- ============================================================================
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

-- ============================================================================
-- TABLE: cms_sections
-- ============================================================================
CREATE TABLE IF NOT EXISTS cms_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page VARCHAR(100) NOT NULL,
    section VARCHAR(100) NOT NULL,
    content JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    UNIQUE KEY unique_page_section (page, section)
);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. USERS
-- --------------------------------------------------------------------------
-- Default admin user (password hash for: admin123)
INSERT IGNORE INTO users (name, email, phone, password, role, email_verified, profile_completed, pin_set, balance, account_number) VALUES
('Admin User', 'admin@aibanking.com', '+250000000000', '$2a$10$rOQJjQJQJQJQJQJQJQJQJuQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ', 'admin', TRUE, TRUE, TRUE, 0.00, 'ADMIN001');

-- Demo users (password: password123 — see note at bottom for hash generation)
INSERT IGNORE INTO users (name, email, phone, password, role, email_verified, profile_completed, pin_set, balance, account_number) VALUES
('John Smith',    'john.smith@example.com',    '+250788123456', '$2a$10$rOQJjQJQJQJQJQJQJQJQJuQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ', 'user', TRUE,  TRUE,  TRUE,  5000.00,  'ACC000001'),
('Sarah Johnson',  'sarah.johnson@example.com',  '+250788234567', '$2a$10$rOQJjQJQJQJQJQJQJQJQJuQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ', 'user', TRUE,  TRUE,  TRUE,  3500.00,  'ACC000002'),
('Michael Brown',  'michael.brown@example.com',  '+250788345678', '$2a$10$rOQJjQJQJQJQJQJQJQJQJuQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ', 'user', TRUE,  TRUE,  FALSE, 1200.00,  'ACC000003'),
('Emily Davis',    'emily.davis@example.com',    '+250788456789', '$2a$10$rOQJjQJQJQJQJQJQJQJQJuQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ', 'user', FALSE, FALSE, FALSE, 800.00,   'ACC000004'),
('David Wilson',   'david.wilson@example.com',   '+250788567890', '$2a$10$rOQJjQJQJQJQJQJQJQJQJuQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ', 'user', TRUE,  TRUE,  TRUE,  7500.00,  'ACC000005');

-- --------------------------------------------------------------------------
-- 2. ADMINS
-- --------------------------------------------------------------------------
INSERT INTO admins (email, password_hash, name, role, status) VALUES (
    'smartbankingpoweredbyai@gmail.com',
    '$2a$10$O48qKRkN3cxbsv3MWoISAO8.NRHd1vJGtFIyVCBVZDf8tAddl47k.',
    'Admin User',
    'super_admin',
    'active'
) ON DUPLICATE KEY UPDATE
    password_hash = '$2a$10$O48qKRkN3cxbsv3MWoISAO8.NRHd1vJGtFIyVCBVZDf8tAddl47k.',
    name = 'Admin User',
    role = 'super_admin',
    status = 'active';

-- --------------------------------------------------------------------------
-- 3. USER PROFILES
-- --------------------------------------------------------------------------
INSERT IGNORE INTO user_profiles (user_id, date_of_birth, address, national_id) VALUES
(2, '1990-05-15', '123 Main St, Kigali, Rwanda', '1199051234567890'),
(3, '1985-08-22', '456 Oak Ave, Kigali, Rwanda', '1198082298765432'),
(4, '1992-03-10', '789 Pine Rd, Kigali, Rwanda', '1192031012345678'),
(5, '1995-11-28', '321 Elm St, Kigali, Rwanda', '1195112856789012'),
(6, '1988-07-14', '654 Maple Dr, Kigali, Rwanda', '1198071498765432');

-- --------------------------------------------------------------------------
-- 4. TRANSACTIONS
-- (5 transactions per demo user, with calculated running balances)
-- --------------------------------------------------------------------------
-- User 2 (John Smith, initial balance 5000.00)
INSERT IGNORE INTO transactions (user_id, type, amount, description, reference_number, status, balance_before, balance_after) VALUES
(2, 'deposit',    1000.00, 'Initial deposit',    'TXN-DEMO-001', 'completed', 5000.00, 6000.00),
(2, 'withdrawal', 200.00,  'ATM withdrawal',     'TXN-DEMO-002', 'completed', 6000.00, 5800.00),
(2, 'payment',    150.00,  'Grocery shopping',   'TXN-DEMO-003', 'completed', 5800.00, 5650.00),
(2, 'deposit',    750.00,  'Freelance payment',  'TXN-DEMO-004', 'completed', 5650.00, 6400.00),
(2, 'payment',    50.00,   'Restaurant bill',    'TXN-DEMO-005', 'completed', 6400.00, 6350.00);

-- User 3 (Sarah Johnson, initial balance 3500.00)
INSERT IGNORE INTO transactions (user_id, type, amount, description, reference_number, status, balance_before, balance_after) VALUES
(3, 'deposit',    1000.00, 'Initial deposit',    'TXN-DEMO-006', 'completed', 3500.00, 4500.00),
(3, 'withdrawal', 200.00,  'ATM withdrawal',     'TXN-DEMO-007', 'completed', 4500.00, 4300.00),
(3, 'payment',    150.00,  'Grocery shopping',   'TXN-DEMO-008', 'completed', 4300.00, 4150.00),
(3, 'deposit',    750.00,  'Freelance payment',  'TXN-DEMO-009', 'completed', 4150.00, 4900.00),
(3, 'payment',    50.00,   'Restaurant bill',    'TXN-DEMO-010', 'completed', 4900.00, 4850.00);

-- User 4 (Michael Brown, initial balance 1200.00)
INSERT IGNORE INTO transactions (user_id, type, amount, description, reference_number, status, balance_before, balance_after) VALUES
(4, 'deposit',    1000.00, 'Initial deposit',    'TXN-DEMO-011', 'completed', 1200.00, 2200.00),
(4, 'withdrawal', 200.00,  'ATM withdrawal',     'TXN-DEMO-012', 'completed', 2200.00, 2000.00),
(4, 'payment',    150.00,  'Grocery shopping',   'TXN-DEMO-013', 'completed', 2000.00, 1850.00),
(4, 'deposit',    750.00,  'Freelance payment',  'TXN-DEMO-014', 'completed', 1850.00, 2600.00),
(4, 'payment',    50.00,   'Restaurant bill',    'TXN-DEMO-015', 'completed', 2600.00, 2550.00);

-- User 5 (Emily Davis, initial balance 800.00)
INSERT IGNORE INTO transactions (user_id, type, amount, description, reference_number, status, balance_before, balance_after) VALUES
(5, 'deposit',    1000.00, 'Initial deposit',    'TXN-DEMO-016', 'completed', 800.00, 1800.00),
(5, 'withdrawal', 200.00,  'ATM withdrawal',     'TXN-DEMO-017', 'completed', 1800.00, 1600.00),
(5, 'payment',    150.00,  'Grocery shopping',   'TXN-DEMO-018', 'completed', 1600.00, 1450.00),
(5, 'deposit',    750.00,  'Freelance payment',  'TXN-DEMO-019', 'completed', 1450.00, 2200.00),
(5, 'payment',    50.00,   'Restaurant bill',    'TXN-DEMO-020', 'completed', 2200.00, 2150.00);

-- User 6 (David Wilson, initial balance 7500.00)
INSERT IGNORE INTO transactions (user_id, type, amount, description, reference_number, status, balance_before, balance_after) VALUES
(6, 'deposit',    1000.00, 'Initial deposit',    'TXN-DEMO-021', 'completed', 7500.00, 8500.00),
(6, 'withdrawal', 200.00,  'ATM withdrawal',     'TXN-DEMO-022', 'completed', 8500.00, 8300.00),
(6, 'payment',    150.00,  'Grocery shopping',   'TXN-DEMO-023', 'completed', 8300.00, 8150.00),
(6, 'deposit',    750.00,  'Freelance payment',  'TXN-DEMO-024', 'completed', 8150.00, 8900.00),
(6, 'payment',    50.00,   'Restaurant bill',    'TXN-DEMO-025', 'completed', 8900.00, 8850.00);

-- --------------------------------------------------------------------------
-- 5. LOANS
-- --------------------------------------------------------------------------
-- Loan 1 -> User 2 (John Smith)
INSERT IGNORE INTO loans (user_id, amount, purpose, duration_months, interest_rate, monthly_payment, total_amount, status) VALUES
(2, 5000.00, 'Home renovation', 12, 8.50, 452.08, 5425.00, 'approved'),
(3, 3000.00, 'Car purchase',    24, 9.00, 136.25, 3270.00, 'disbursed'),
(4, 1500.00, 'Emergency fund',  6,  10.00, 275.00, 1650.00, 'pending');

-- --------------------------------------------------------------------------
-- 6. SAVINGS GOALS
-- --------------------------------------------------------------------------
INSERT IGNORE INTO savings_goals (user_id, name, target_amount, current_amount, target_date, status) VALUES
(2, 'Emergency Fund',     10000.00, 3500.00, '2024-12-31', 'active'),
(3, 'Vacation Fund',      3000.00,  1200.00, '2024-08-31', 'active'),
(4, 'New Laptop',         1500.00,  1500.00, '2024-06-30', 'completed'),
(5, 'Home Down Payment',  50000.00, 8000.00, '2025-12-31', 'active');

-- --------------------------------------------------------------------------
-- 7. NOTIFICATIONS (3 per demo user)
-- --------------------------------------------------------------------------
INSERT IGNORE INTO notifications (user_id, title, message, type) VALUES
(2, 'Welcome to AI Banking',      'Your account has been successfully created. Start exploring our features!',                         'info'),
(2, 'Deposit Received',           'You have received a deposit of $1,000.00',                                                          'success'),
(2, 'Loan Application Approved',  'Your loan application for $5,000.00 has been approved.',                                            'success'),
(3, 'Welcome to AI Banking',      'Your account has been successfully created. Start exploring our features!',                         'info'),
(3, 'Deposit Received',           'You have received a deposit of $1,000.00',                                                          'success'),
(3, 'Loan Application Approved',  'Your loan application for $5,000.00 has been approved.',                                            'success'),
(4, 'Welcome to AI Banking',      'Your account has been successfully created. Start exploring our features!',                         'info'),
(4, 'Deposit Received',           'You have received a deposit of $1,000.00',                                                          'success'),
(4, 'Loan Application Approved',  'Your loan application for $5,000.00 has been approved.',                                            'success'),
(5, 'Welcome to AI Banking',      'Your account has been successfully created. Start exploring our features!',                         'info'),
(5, 'Deposit Received',           'You have received a deposit of $1,000.00',                                                          'success'),
(5, 'Loan Application Approved',  'Your loan application for $5,000.00 has been approved.',                                            'success'),
(6, 'Welcome to AI Banking',      'Your account has been successfully created. Start exploring our features!',                         'info'),
(6, 'Deposit Received',           'You have received a deposit of $1,000.00',                                                          'success'),
(6, 'Loan Application Approved',  'Your loan application for $5,000.00 has been approved.',                                            'success');

-- --------------------------------------------------------------------------
-- 8. PAYMENT CATEGORIES
-- --------------------------------------------------------------------------
INSERT IGNORE INTO payment_categories (name, icon, description, sort_order) VALUES
('Utilities',        'zap',        'Electricity, water, and other utilities',             1),
('TV & Entertainment', 'tv',       'DSTV, GOtv, Showmax, and streaming services',         2),
('Internet',         'wifi',       'Internet service providers',                          3),
('Mobile',           'smartphone', 'Airtime and data top-ups',                            4),
('Insurance',        'shield',     'Insurance premium payments',                          5),
('Education',        'book',       'School fees and education payments',                  6),
('Government',       'building',   'Government services and taxes',                       7),
('Other',            'grid',       'Other payment types',                                 99);

-- --------------------------------------------------------------------------
-- 9. PAYMENT PROVIDERS
-- --------------------------------------------------------------------------
INSERT IGNORE INTO payment_providers (category_id, name, provider_code, description, min_amount, max_amount)
SELECT cat.id, 'REG Water', 'REG_WATER', 'Rwanda Energy Group - Water bill payments', 500, 500000
FROM payment_categories cat WHERE cat.name = 'Utilities';

INSERT IGNORE INTO payment_providers (category_id, name, provider_code, description, min_amount, max_amount)
SELECT cat.id, 'DSTV', 'DSTV', 'DSTV subscription payments', 5000, 200000
FROM payment_categories cat WHERE cat.name = 'TV & Entertainment';

INSERT IGNORE INTO payment_providers (category_id, name, provider_code, description, min_amount, max_amount)
SELECT cat.id, 'GOtv', 'GOTV', 'GOtv subscription payments', 3000, 100000
FROM payment_categories cat WHERE cat.name = 'TV & Entertainment';

INSERT IGNORE INTO payment_providers (category_id, name, provider_code, description, min_amount, max_amount)
SELECT cat.id, 'MTN Airtime', 'MTN_AIRTIME', 'MTN mobile airtime top-up', 100, 100000
FROM payment_categories cat WHERE cat.name = 'Mobile';

INSERT IGNORE INTO payment_providers (category_id, name, provider_code, description, min_amount, max_amount)
SELECT cat.id, 'MTN Data', 'MTN_DATA', 'MTN mobile data bundle purchase', 100, 50000
FROM payment_categories cat WHERE cat.name = 'Mobile';

INSERT IGNORE INTO payment_providers (category_id, name, provider_code, description, min_amount, max_amount)
SELECT cat.id, 'Airtel Airtime', 'AIRTEL_AIRTIME', 'Airtel mobile airtime top-up', 100, 100000
FROM payment_categories cat WHERE cat.name = 'Mobile';

-- --------------------------------------------------------------------------
-- 10. INVESTMENT TYPES
-- --------------------------------------------------------------------------
INSERT IGNORE INTO investment_types (id, name, description, min_amount, allowed_risk_levels, expected_returns) VALUES
('stocks',     'Stock Market',              'Invest in listed companies on Rwanda Stock Exchange', 10000, '["medium", "high"]',   '{"low": 8, "medium": 15, "high": 25}'),
('bonds',      'Bonds & Fixed Income',      'Low-risk government and corporate bonds',           5000,  '["low", "medium"]',    '{"low": 4, "medium": 8, "high": 12}'),
('startups',   'Startups & Innovation',     'Invest in promising Rwandan startups',              25000, '["medium", "high"]',   '{"low": 10, "medium": 22, "high": 40}'),
('realestate', 'Real Estate',               'Property investment opportunities',                 50000, '["low", "medium"]',    '{"low": 6, "medium": 12, "high": 20}');

-- --------------------------------------------------------------------------
-- 11. CMS SECTIONS
-- --------------------------------------------------------------------------
INSERT IGNORE INTO cms_sections (page, section, content) VALUES
('about', 'main', JSON_OBJECT(
    'title', 'About AI Banking Rwanda',
    'description', 'AI Banking is Rwanda''s leading digital banking platform, combining cutting-edge artificial intelligence with traditional banking services to provide you with a seamless, secure, and intelligent banking experience.',
    'mission', 'To revolutionize banking in Rwanda through AI-powered financial solutions that are accessible, affordable, and tailored to every Rwandan''s needs.',
    'vision', 'To become the most trusted digital banking partner for every Rwandan, empowering financial inclusion and economic growth through technology.',
    'values', JSON_ARRAY(
        JSON_OBJECT('title', 'Innovation',       'description', 'We leverage AI and technology to create smarter banking solutions'),
        JSON_OBJECT('title', 'Security',         'description', 'Your financial security is our top priority with advanced encryption and fraud detection'),
        JSON_OBJECT('title', 'Accessibility',    'description', 'Banking services available to everyone, everywhere in Rwanda'),
        JSON_OBJECT('title', 'Customer-Centric', 'description', 'Every solution is designed with our customers'' needs at the forefront')
    ),
    'stats', JSON_ARRAY(
        JSON_OBJECT('label', 'Active Users',          'value', '50,000+'),
        JSON_OBJECT('label', 'Transactions Daily',    'value', '10,000+'),
        JSON_OBJECT('label', 'Coverage',              'value', 'All 30 Districts'),
        JSON_OBJECT('label', 'Customer Satisfaction', 'value', '98%')
    )
)),
('contact', 'main', JSON_OBJECT(
    'title', 'Contact Us',
    'description', 'We''re here to help you with all your banking needs. Reach out to us through any of the following channels:',
    'contactMethods', JSON_ARRAY(
        JSON_OBJECT('type', 'Phone',    'value', '0787427123', 'description', 'Available 24/7 for customer support', 'icon', 'phone'),
        JSON_OBJECT('type', 'Email',    'value', 'smartbankingpoweredbyai@gmail.com', 'description', 'We''ll respond within 24 hours', 'icon', 'email'),
        JSON_OBJECT('type', 'WhatsApp', 'value', '0787427123', 'description', 'Chat with us instantly on WhatsApp',  'icon', 'whatsapp')
    ),
    'socialMedia', JSON_ARRAY(
        JSON_OBJECT('platform', 'Facebook',  'url', 'https://facebook.com/aibankingrw',  'handle', '@aibankingrw'),
        JSON_OBJECT('platform', 'Twitter',   'url', 'https://twitter.com/aibankingrw',   'handle', '@aibankingrw'),
        JSON_OBJECT('platform', 'LinkedIn',  'url', 'https://linkedin.com/company/aibankingrw', 'handle', 'AI Banking Rwanda'),
        JSON_OBJECT('platform', 'Instagram', 'url', 'https://instagram.com/aibankingrw', 'handle', '@aibankingrw')
    )
)),
('services', 'main', JSON_OBJECT(
    'title', 'Our Services',
    'description', 'Discover our comprehensive range of AI-powered banking services designed to meet your financial needs:',
    'services', JSON_ARRAY(
        JSON_OBJECT('title', 'Smart Savings',     'description', 'AI-powered savings accounts that help you save smarter with personalized recommendations and automated savings goals.', 'features', JSON_ARRAY('AI Savings Insights', 'Goal-based Savings', 'Automated Transfers', 'Competitive Interest Rates'), 'icon', 'savings'),
        JSON_OBJECT('title', 'Digital Loans',     'description', 'Quick and easy loan approvals powered by AI credit scoring. Get funds within minutes.', 'features', JSON_ARRAY('Instant Approval', 'Flexible Terms', 'Low Interest Rates', 'No Collateral Required'), 'icon', 'loan'),
        JSON_OBJECT('title', 'Mobile Banking',    'description', 'Complete banking services on your mobile device. Bank anytime, anywhere.', 'features', JSON_ARRAY('24/7 Access', 'Bill Payments', 'Money Transfers', 'Mobile Top-up'), 'icon', 'mobile'),
        JSON_OBJECT('title', 'Investment Services','description', 'AI-driven investment recommendations tailored to your risk profile and financial goals.', 'features', JSON_ARRAY('AI Portfolio Management', 'Risk Assessment', 'Market Insights', 'Diversified Options'), 'icon', 'investment'),
        JSON_OBJECT('title', 'Business Banking',  'description', 'Comprehensive banking solutions for businesses of all sizes in Rwanda.', 'features', JSON_ARRAY('Business Accounts', 'Payroll Services', 'Trade Finance', 'Business Loans'), 'icon', 'business'),
        JSON_OBJECT('title', 'Insurance Products', 'description', 'Protect what matters most with our range of insurance products.', 'features', JSON_ARRAY('Life Insurance', 'Health Insurance', 'Property Insurance', 'Vehicle Insurance'), 'icon', 'insurance')
    )
)),
('faq', 'main', JSON_OBJECT(
    'title', 'Frequently Asked Questions',
    'description', 'Find answers to common questions about AI Banking Rwanda:',
    'categories', JSON_ARRAY(
        JSON_OBJECT('category', 'Getting Started', 'questions', JSON_ARRAY(
            JSON_OBJECT('question', 'How do I open an account with AI Banking?', 'answer', 'You can open an account by clicking ''Register'' on our app or website. The process takes just a few minutes and you''ll need your email, phone number, and a valid ID.'),
            JSON_OBJECT('question', 'What documents do I need to register?', 'answer', 'You''ll need a valid national ID, email address, phone number, and to be at least 18 years old.'),
            JSON_OBJECT('question', 'Is AI Banking available in all parts of Rwanda?', 'answer', 'Yes! AI Banking is available across all 30 districts of Rwanda through our mobile app and physical branches.')
        )),
        JSON_OBJECT('category', 'Account Security', 'questions', JSON_ARRAY(
            JSON_OBJECT('question', 'How secure is my account?', 'answer', 'We use bank-level encryption, two-factor authentication, and AI-powered fraud detection to keep your account secure.'),
            JSON_OBJECT('question', 'What should I do if I forget my password?', 'answer', 'You can reset your password using the ''Forgot Password'' option on the login page. We''ll send you a secure link to reset it.'),
            JSON_OBJECT('question', 'How does the transaction PIN work?', 'answer', 'Your 4-digit transaction PIN adds an extra layer of security for all your banking transactions. Never share it with anyone.')
        )),
        JSON_OBJECT('category', 'Services & Fees', 'questions', JSON_ARRAY(
            JSON_OBJECT('question', 'What are the fees for using AI Banking?', 'answer', 'Basic account maintenance is free. We charge competitive fees for specific services like transfers and loans. Check our fee schedule for details.'),
            JSON_OBJECT('question', 'How quickly can I get a loan?', 'answer', 'With our AI-powered credit scoring, most loan applications are approved within minutes and funds are disbursed immediately.'),
            JSON_OBJECT('question', 'Can I use AI Banking internationally?', 'answer', 'Yes, you can access your account and make transactions internationally, though some fees may apply for international transfers.')
        ))
    )
));

-- ============================================================================
-- VIEW: user_dashboard
-- ============================================================================
CREATE OR REPLACE VIEW user_dashboard AS
SELECT
    u.id,
    u.name,
    u.email,
    u.balance,
    u.account_number,
    COUNT(DISTINCT CASE WHEN t.type = 'deposit' AND t.status = 'completed' THEN t.id END) as deposit_count,
    COUNT(DISTINCT CASE WHEN t.type = 'withdrawal' AND t.status = 'completed' THEN t.id END) as withdrawal_count,
    COUNT(DISTINCT CASE WHEN t.type = 'payment' AND t.status = 'completed' THEN t.id END) as payment_count,
    COUNT(DISTINCT CASE WHEN l.status IN ('approved', 'disbursed') THEN l.id END) as active_loans,
    COUNT(DISTINCT CASE WHEN sg.status = 'active' THEN sg.id END) as active_savings_goals,
    u.created_at as member_since
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN loans l ON u.id = l.user_id
LEFT JOIN savings_goals sg ON u.id = sg.user_id
GROUP BY u.id, u.name, u.email, u.balance, u.account_number, u.created_at;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- Demo user passwords: "password123" for all 5 demo users
-- Admin user (admin@aibanking.com) password: determined by bcrypt hash in INSERT
-- Admin panel (smartbankingpoweredbyai@gmail.com) password: irene12003
--
-- To generate proper bcrypt hashes for demo user passwords, run:
--   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password123', 10));"
-- Then replace the hash values in the users INSERT above.
-- ============================================================================
