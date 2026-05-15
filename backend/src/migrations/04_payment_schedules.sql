-- Payment Schedules Table Migration
-- Run this in MySQL Workbench or directly on the database

CREATE TABLE IF NOT EXISTS payment_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
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

-- Add deduction columns to loans table
ALTER TABLE loans ADD COLUMN deduction_amount DECIMAL(15,2) DEFAULT NULL AFTER ai_decision;
ALTER TABLE loans ADD COLUMN deduction_period ENUM('daily','weekly','monthly') DEFAULT NULL AFTER deduction_amount;
ALTER TABLE loans ADD COLUMN paid_amount DECIMAL(15,2) DEFAULT 0.00 AFTER deduction_period;
ALTER TABLE loans ADD COLUMN next_deduction_date DATE DEFAULT NULL AFTER paid_amount;
ALTER TABLE loans ADD COLUMN extensions JSON DEFAULT NULL AFTER next_deduction_date;
