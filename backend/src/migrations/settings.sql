-- Security Settings Table
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

-- Notification Settings Table
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

-- Privacy Settings Table
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

-- Transaction Limits Table
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

-- User Preferences Table
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

-- Cards Table
CREATE TABLE IF NOT EXISTS cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_type VARCHAR(20) NOT NULL, -- 'debit', 'credit', 'virtual'
  card_number VARCHAR(20) NOT NULL,
  card_holder_name VARCHAR(100) NOT NULL,
  expiry_date VARCHAR(7) NOT NULL, -- MM/YY format
  cvv VARCHAR(4),
  card_status VARCHAR(20) DEFAULT 'active', -- 'active', 'blocked', 'expired'
  is_default BOOLEAN DEFAULT FALSE,
  daily_limit DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_cards_user (user_id),
  INDEX idx_cards_number (card_number)
);

-- Statements Table
CREATE TABLE IF NOT EXISTS statements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  statement_type VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'annual'
  statement_period VARCHAR(50) NOT NULL, -- e.g., 'January 2024', 'Q1 2024'
  file_path VARCHAR(255),
  file_size INT,
  download_count INT DEFAULT 0,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_statements_user (user_id),
  INDEX idx_statements_period (statement_period)
);
