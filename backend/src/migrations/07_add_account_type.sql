ALTER TABLE accounts 
  ADD COLUMN account_type VARCHAR(50) DEFAULT 'savings' AFTER currency;
