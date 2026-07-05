-- Add 'investment' to transactions.type ENUM
ALTER TABLE transactions 
MODIFY COLUMN type ENUM('deposit', 'withdrawal', 'transfer', 'payment', 'loan_disbursement', 'loan_repayment', 'investment') NOT NULL;
