-- Clean All Demo/Existing Data from Database
-- Run this in MySQL Workbench to reset all tables to empty state
-- WARNING: This will delete ALL data. Only run in development.

USE smart_banking_powered_by_ai;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE ai_insights;
TRUNCATE TABLE beneficiaries;
TRUNCATE TABLE cards;
TRUNCATE TABLE loan_repayments;
TRUNCATE TABLE loans;
TRUNCATE TABLE notifications;
TRUNCATE TABLE payments;
TRUNCATE TABLE payment_methods;
TRUNCATE TABLE savings_goals;
TRUNCATE TABLE transactions;
TRUNCATE TABLE user_profiles;
TRUNCATE TABLE user_security;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto-increment counters
ALTER TABLE ai_insights AUTO_INCREMENT = 1;
ALTER TABLE beneficiaries AUTO_INCREMENT = 1;
ALTER TABLE cards AUTO_INCREMENT = 1;
ALTER TABLE loan_repayments AUTO_INCREMENT = 1;
ALTER TABLE loans AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE payments AUTO_INCREMENT = 1;
ALTER TABLE payment_methods AUTO_INCREMENT = 1;
ALTER TABLE savings_goals AUTO_INCREMENT = 1;
ALTER TABLE transactions AUTO_INCREMENT = 1;
ALTER TABLE user_profiles AUTO_INCREMENT = 1;
ALTER TABLE user_security AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- Reset the payments, payment_methods, payment_categories, payment_providers tables too
TRUNCATE TABLE IF EXISTS payment_providers;
TRUNCATE TABLE IF EXISTS payment_categories;
