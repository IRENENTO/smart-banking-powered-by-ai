-- Database Migration for Registration Flow Refactor
-- Add new columns to users table

-- Add phone number column
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NOT NULL DEFAULT '';

-- Add verification status columns
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN profile_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN pin_set BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending';

-- Create OTP table for verification
CREATE TABLE IF NOT EXISTS otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_email (user_id, email),
    INDEX idx_otp_code (otp_code),
    INDEX idx_expires_at (expires_at)
);

-- Create user_profiles table for additional profile information
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

-- Create user_security table for PIN and security settings
CREATE TABLE IF NOT EXISTS user_security (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_pin VARCHAR(255) NOT NULL,
    pin_attempts INT NOT NULL DEFAULT 0,
    pin_locked_until DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_security (user_id)
);

-- Create kyc_documents table for KYC verification
CREATE TABLE IF NOT EXISTS kyc_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    document_type ENUM('national_id', 'selfie', 'passport', 'driving_license') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    upload_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    rejection_reason TEXT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_document_type (user_id, document_type),
    INDEX idx_upload_status (upload_status)
);

-- Add indexes for better performance
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_profile_completed ON users(profile_completed);
CREATE INDEX idx_users_pin_set ON users(pin_set);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_phone ON users(phone);

-- Update existing users to have default values for backward compatibility
UPDATE users SET 
    phone = CASE WHEN phone IS NULL OR phone = '' THEN CONCAT('250', SUBSTRING(id, 1, 9)) ELSE phone END,
    email_verified = FALSE,
    profile_completed = FALSE,
    pin_set = FALSE,
    kyc_status = 'pending'
WHERE phone IS NULL OR phone = '' OR email_verified IS NULL OR profile_completed IS NULL OR pin_set IS NULL OR kyc_status IS NULL;

-- =====================================================
-- CORE BANKING TABLES (AI Smart Lend)
-- =====================================================

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'RWF',
    account_type VARCHAR(50) DEFAULT 'savings',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_account_user_id (user_id),
    INDEX idx_account_created_at (created_at)
);

-- Create transactions table (extended from existing schema)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('deposit', 'withdraw', 'transfer', 'payment') NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    description VARCHAR(255),
    reference_number VARCHAR(50) UNIQUE,
    recipient_account_number VARCHAR(50),
    recipient_name VARCHAR(255),
    balance_before DECIMAL(18, 2),
    balance_after DECIMAL(18, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_txn_user_id (user_id),
    INDEX idx_txn_type (type),
    INDEX idx_txn_status (status),
    INDEX idx_txn_created_at (created_at),
    INDEX idx_txn_reference (reference_number)
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    purpose VARCHAR(255),
    duration INT,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    risk_score DECIMAL(5, 2),
    monthly_income DECIMAL(18, 2),
    existing_debt DECIMAL(18, 2),
    ai_decision TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_loan_user_id (user_id),
    INDEX idx_loan_status (status),
    INDEX idx_loan_created_at (created_at)
);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type ENUM('risk', 'investment', 'alert', 'recommendation') NOT NULL DEFAULT 'recommendation',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_insight_user_id (user_id),
    INDEX idx_insight_type (type),
    INDEX idx_insight_created_at (created_at)
);

-- Add balance column to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_number VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id VARCHAR(50);
