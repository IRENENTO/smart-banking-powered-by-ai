-- One-time cleanup: remove KYC artifacts from databases that still have them.
-- Run after pulling KYC removal: mysql -u root -p your_database < database/drop_kyc.sql

DROP TABLE IF EXISTS kyc_documents;
DROP TABLE IF EXISTS kyc_submissions;
DROP TABLE IF EXISTS kyc_verifications;
DROP TABLE IF EXISTS kyc;

SET @dbname = DATABASE();
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'users' AND COLUMN_NAME = 'kyc_status'
);
SET @sql := IF(@col_exists > 0, 'ALTER TABLE users DROP COLUMN kyc_status', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
