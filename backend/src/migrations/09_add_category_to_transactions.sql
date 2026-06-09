ALTER TABLE transactions
ADD COLUMN category VARCHAR(50) DEFAULT 'other' AFTER recipient_name;
