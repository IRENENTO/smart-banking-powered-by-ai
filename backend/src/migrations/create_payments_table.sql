-- Payments Table Migration
-- Add this to your MySQL Workbench or run it directly on your database

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    payment_type ENUM('bill', 'merchant', 'subscription', 'invoice', 'top_up', 'other', 'deposit', 'withdrawal') NOT NULL,
    provider VARCHAR(255) NOT NULL COMMENT 'e.g., MTN, Airtel, DSTV, Utility Company',
    provider_reference VARCHAR(100) COMMENT 'Reference from payment provider',
    account_or_phone VARCHAR(50) COMMENT 'Account number, phone number, or subscriber ID',
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RWF',
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    description VARCHAR(500),
    metadata JSON COMMENT 'Additional payment details',
    transaction_reference VARCHAR(100) UNIQUE COMMENT 'Link to transactions table',
    balance_before DECIMAL(15,2) COMMENT 'User balance before payment',
    balance_after DECIMAL(15,2) COMMENT 'User balance after payment',
    paid_at DATETIME NULL COMMENT 'When payment was successfully processed',
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

-- Create payment_methods table to store user's saved payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    method_type ENUM('card', 'mobile_money', 'bank_account', 'wallet') NOT NULL,
    provider_name VARCHAR(100) NOT NULL COMMENT 'e.g., Visa, MTN MoMo, Airtel Money',
    account_identifier VARCHAR(100) COMMENT 'Masked card number, phone number, etc.',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON COMMENT 'Provider-specific details',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_method_type (method_type),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payment_categories table for bill categories
CREATE TABLE IF NOT EXISTS payment_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) COMMENT 'Icon identifier for UI',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create payment_providers table for available payment providers
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
    metadata JSON COMMENT 'Provider configuration',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES payment_categories(id) ON DELETE SET NULL,
    INDEX idx_category_id (category_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default payment categories
INSERT INTO payment_categories (name, icon, description, sort_order) VALUES
('Utilities', 'zap', 'Electricity, water, and other utilities', 1),
('TV & Entertainment', 'tv', 'DSTV, GOtv, Showmax, and streaming services', 2),
('Internet', 'wifi', 'Internet service providers', 3),
('Mobile', 'smartphone', 'Airtime and data top-ups', 4),
('Insurance', 'shield', 'Insurance premium payments', 5),
('Education', 'book', 'School fees and education payments', 6),
('Government', 'building', 'Government services and taxes', 7),
('Other', 'grid', 'Other payment types', 99)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert default payment providers (example)
INSERT INTO payment_providers (category_id, name, provider_code, description, min_amount, max_amount) VALUES
((SELECT id FROM payment_categories WHERE name = 'Utilities'), 'REG Water', 'REG_WATER', 'Rwanda Energy Group - Water bill payments', 500, 500000),
((SELECT id FROM payment_categories WHERE name = 'TV & Entertainment'), 'DSTV', 'DSTV', 'DSTV subscription payments', 5000, 200000),
((SELECT id FROM payment_categories WHERE name = 'TV & Entertainment'), 'GOtv', 'GOTV', 'GOtv subscription payments', 3000, 100000),
((SELECT id FROM payment_categories WHERE name = 'Mobile'), 'MTN Airtime', 'MTN_AIRTIME', 'MTN mobile airtime top-up', 100, 100000),
((SELECT id FROM payment_categories WHERE name = 'Mobile'), 'MTN Data', 'MTN_DATA', 'MTN mobile data bundle purchase', 100, 50000),
((SELECT id FROM payment_categories WHERE name = 'Mobile'), 'Airtel Airtime', 'AIRTEL_AIRTIME', 'Airtel mobile airtime top-up', 100, 100000)
ON DUPLICATE KEY UPDATE name = VALUES(name);
