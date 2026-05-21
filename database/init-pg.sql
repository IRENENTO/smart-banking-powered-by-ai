-- PostgreSQL Schema for AI Banking Platform
-- Run this in Supabase SQL Editor after creating a project

-- =====================================================
-- USERS & AUTH
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL DEFAULT '',
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    pin_set BOOLEAN NOT NULL DEFAULT FALSE,
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    account_number VARCHAR(50) UNIQUE,
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_codes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_user_email ON otp_codes(user_id, email);
CREATE INDEX idx_otp_code ON otp_codes(otp_code);
CREATE INDEX idx_otp_expires ON otp_codes(expires_at);

-- =====================================================
-- USER PROFILES & SECURITY
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    address TEXT,
    national_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_security (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    transaction_pin VARCHAR(255) NOT NULL,
    pin_attempts INT NOT NULL DEFAULT 0,
    pin_locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ADMIN TABLE (from admin-auth.routes)
-- =====================================================

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CORE BANKING
-- =====================================================

CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'RWF',
    account_type VARCHAR(50) DEFAULT 'savings',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'transfer', 'payment')),
    amount DECIMAL(18, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    description VARCHAR(255),
    reference_number VARCHAR(50) UNIQUE,
    recipient_account_number VARCHAR(50),
    recipient_name VARCHAR(255),
    balance_before DECIMAL(18, 2),
    balance_after DECIMAL(18, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_txn_user_id ON transactions(user_id);
CREATE INDEX idx_txn_type ON transactions(type);
CREATE INDEX idx_txn_status ON transactions(status);
CREATE INDEX idx_txn_reference ON transactions(reference_number);

CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(18, 2) NOT NULL,
    purpose VARCHAR(255),
    duration_months INT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    risk_score DECIMAL(5, 2),
    monthly_income DECIMAL(18, 2),
    existing_debt DECIMAL(18, 2),
    ai_decision TEXT,
    deduction_amount DECIMAL(18, 2),
    deduction_period VARCHAR(20),
    paid_amount DECIMAL(18, 2) DEFAULT 0,
    next_deduction_date DATE,
    due_date DATE,
    interest_rate DECIMAL(5, 2) DEFAULT 10,
    total_amount DECIMAL(18, 2),
    extensions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loan_user_id ON loans(user_id);
CREATE INDEX idx_loan_status ON loans(status);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_reference VARCHAR(255),
    account_or_phone VARCHAR(100),
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RWF',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    metadata TEXT,
    transaction_reference VARCHAR(100),
    balance_before DECIMAL(18, 2),
    balance_after DECIMAL(18, 2),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_user_id ON payments(user_id);
CREATE INDEX idx_payment_status ON payments(status);
CREATE INDEX idx_payment_type ON payments(payment_type);

-- =====================================================
-- INVESTMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    duration INT,
    risk_level VARCHAR(20),
    expected_return DECIMAL(18, 2),
    actual_return DECIMAL(18, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inv_user_id ON investments(user_id);

-- =====================================================
-- AI INSIGHTS
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'recommendation',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insight_user_id ON ai_insights(user_id);
CREATE INDEX idx_insight_type ON ai_insights(type);

-- =====================================================
-- SAVINGS GOALS & SCHEDULES
-- =====================================================

CREATE TABLE IF NOT EXISTS savings_goals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(18, 2) NOT NULL,
    current_amount DECIMAL(18, 2) DEFAULT 0,
    target_date DATE NOT NULL,
    auto_deduction_amount DECIMAL(18, 2),
    auto_deduction_period VARCHAR(20),
    last_deduction_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_schedules (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    recipient_type VARCHAR(50),
    recipient_value VARCHAR(255),
    amount DECIMAL(18, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_payment_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SETTINGS & PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS security_settings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    sms_alerts BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT TRUE,
    login_notifications BOOLEAN DEFAULT TRUE,
    session_timeout INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_transactions BOOLEAN DEFAULT TRUE,
    sms_transactions BOOLEAN DEFAULT FALSE,
    email_promotions BOOLEAN DEFAULT FALSE,
    sms_promotions BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    weekly_summary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS privacy_settings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    data_sharing BOOLEAN DEFAULT FALSE,
    analytics_consent BOOLEAN DEFAULT TRUE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    public_profile BOOLEAN DEFAULT FALSE,
    location_tracking BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_limits (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    daily_limit DECIMAL(18, 2) DEFAULT 1000000,
    weekly_limit DECIMAL(18, 2) DEFAULT 5000000,
    monthly_limit DECIMAL(18, 2) DEFAULT 20000000,
    single_transaction_limit DECIMAL(18, 2) DEFAULT 500000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(10) DEFAULT 'RWF',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Africa/Kigali',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    theme VARCHAR(20) DEFAULT 'light',
    large_text BOOLEAN DEFAULT FALSE,
    high_contrast BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CARDS & STATEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_type VARCHAR(50) NOT NULL,
    card_number VARCHAR(50) NOT NULL,
    card_holder_name VARCHAR(255) NOT NULL,
    expiry_date VARCHAR(10) NOT NULL,
    cvv VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    card_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS statements (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    statement_type VARCHAR(20) NOT NULL,
    statement_period VARCHAR(100),
    file_path VARCHAR(500),
    file_size INT,
    download_count INT DEFAULT 0,
    generated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
