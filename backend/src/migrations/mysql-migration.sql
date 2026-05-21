-- MySQL Migration Script for Smart Banking Powered by AI
-- Database: smart_banking_powered_by_ai

-- Create users table
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

-- Create user_profiles table
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

-- Create user_security table
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

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('deposit', 'withdrawal', 'transfer', 'payment', 'loan_disbursement', 'loan_repayment') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(500),
    reference_number VARCHAR(100) UNIQUE,
    recipient_account_number VARCHAR(20),
    recipient_name VARCHAR(255),
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

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    purpose VARCHAR(500),
    duration_months INT NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 10.00,
    monthly_payment DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    status ENUM('pending', 'approved', 'rejected', 'disbursed', 'completed', 'defaulted') DEFAULT 'pending',
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

-- Create loan_repayments table
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

-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    target_date DATE,
    status ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Create beneficiaries table
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

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_number VARCHAR(20) NOT NULL,
    card_type ENUM('debit', 'credit') DEFAULT 'debit',
    card_brand ENUM('visa', 'mastercard', 'amex') DEFAULT 'visa',
    expiry_date VARCHAR(10) NOT NULL,
    cvv VARCHAR(4),
    status ENUM('active', 'blocked', 'expired', 'cancelled') DEFAULT 'active',
    daily_limit DECIMAL(15,2) DEFAULT 1000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 10000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_card_number (card_number),
    INDEX idx_status (status)
);

-- Insert default admin user
INSERT INTO users (name, email, phone, password, role, email_verified, profile_completed, pin_set, balance, account_number) 
VALUES ('Admin User', 'admin@aibanking.com', '+250000000000', '$2a$10$rOQJjQJQJQJQJQJQJQJQJuQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ', 'admin', TRUE, TRUE, TRUE, 0.00, 'ADMIN001')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Create view for user dashboard summary
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
