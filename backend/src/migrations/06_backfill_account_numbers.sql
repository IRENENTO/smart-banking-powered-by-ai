-- Assign account numbers to existing users who don't have one
-- This is needed because the registration auto-generates account_number,
-- but existing users registered before that feature may have NULL.

SET @i = 0;
UPDATE users
SET account_number = CONCAT('ACC', LPAD(@i := @i + 1, 6, '0'))
WHERE account_number IS NULL OR account_number = '';
