-- Add recipient_type and recipient_value to payment_schedules
ALTER TABLE payment_schedules
  ADD COLUMN recipient_type ENUM('phone','account') DEFAULT 'account' AFTER description,
  ADD COLUMN recipient_value VARCHAR(50) NOT NULL DEFAULT '' AFTER recipient_type;
