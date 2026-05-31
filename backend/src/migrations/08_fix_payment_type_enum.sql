-- Fix payments.payment_type ENUM to include 'deposit' and 'withdrawal'
-- The deposit/withdraw controllers use these values but the ENUM was missing them

ALTER TABLE payments
MODIFY COLUMN payment_type ENUM('bill', 'merchant', 'subscription', 'invoice', 'top_up', 'other', 'deposit', 'withdrawal') NOT NULL;
