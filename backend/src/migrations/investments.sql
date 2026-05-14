-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'stocks, bonds, startups, realestate',
    amount DECIMAL(15,2) NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in months',
    risk_level ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    expected_return DECIMAL(5,2) NOT NULL COMMENT 'Expected return percentage',
    actual_return DECIMAL(15,2) DEFAULT 0 COMMENT 'Actual returns earned',
    status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_investments (user_id),
    INDEX idx_investment_type (type),
    INDEX idx_investment_status (status)
);

-- Insert sample investment types configuration
CREATE TABLE IF NOT EXISTS investment_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_amount DECIMAL(15,2) NOT NULL DEFAULT 5000,
    allowed_risk_levels JSON NOT NULL,
    expected_returns JSON NOT NULL COMMENT 'Returns by risk level',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default investment types
INSERT IGNORE INTO investment_types (id, name, description, min_amount, allowed_risk_levels, expected_returns) VALUES
('stocks', 'Stock Market', 'Invest in listed companies on Rwanda Stock Exchange', 10000, '["medium", "high"]', '{"low": 8, "medium": 15, "high": 25}'),
('bonds', 'Bonds & Fixed Income', 'Low-risk government and corporate bonds', 5000, '["low", "medium"]', '{"low": 4, "medium": 8, "high": 12}'),
('startups', 'Startups & Innovation', 'Invest in promising Rwandan startups', 25000, '["medium", "high"]', '{"low": 10, "medium": 22, "high": 40}'),
('realestate', 'Real Estate', 'Property investment opportunities', 50000, '["low", "medium"]', '{"low": 6, "medium": 12, "high": 20}');
