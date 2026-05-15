-- Fix loans table: add missing columns for loan risk analysis
-- The original mysql-migration.sql created the loans table without these columns

-- Run each statement separately. If a column already exists, skip the error.
ALTER TABLE loans ADD COLUMN risk_score DECIMAL(5,2) AFTER status;
ALTER TABLE loans ADD COLUMN monthly_income DECIMAL(18,2) AFTER purpose;
ALTER TABLE loans ADD COLUMN existing_debt DECIMAL(18,2) AFTER monthly_income;
ALTER TABLE loans ADD COLUMN ai_decision TEXT AFTER existing_debt;
